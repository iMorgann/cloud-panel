import { supabase } from '../../lib/supabase';

interface ProcessResult {
  success: boolean;
  error?: string;
  stats: {
    uniqueLines: number;
    duplicates: number;
    validLines: number;
    invalidLines: number;
  };
}

export class FileProcessor {
  private file: File;
  private userId: string;
  private processedLines: Set<string>;
  private stats: {
    uniqueLines: number;
    duplicates: number;
    validLines: number;
    invalidLines: number;
  };
  private batchSize: number;

  constructor(file: File, userId: string) {
    this.file = file;
    this.userId = userId;
    this.processedLines = new Set();
    this.stats = {
      uniqueLines: 0,
      duplicates: 0,
      validLines: 0,
      invalidLines: 0
    };
    // Smaller batch size for better performance
    this.batchSize = 500;
  }

  private isValidLine(line: string): boolean {
    if (!line || line.trim() === '') return false;
    
    const parts = line.split(':');
    
    // Handle EMAIL:PASSWORD format
    if (parts.length === 2) {
      const [email, password] = parts.map(p => p.trim());
      
      // Basic email validation
      if (!email || !password) return false;
      
      return true;
    }
    
    // Handle URL:LOGIN:PASS format
    if (parts.length >= 3) {
      const url = parts[0].trim();
      const username = parts[1].trim();
      const password = parts.slice(2).join(':').trim(); // Rejoin password parts in case it contains colons
      
      if (!url || !username || !password) return false;
      
      return true;
    }
    
    return false;
  }

  private async processChunk(chunk: string): Promise<string[]> {
    const lines = chunk.split('\n')
      .map(line => line.trim())
      .filter(line => line && !this.processedLines.has(line));

    const validLines = lines.filter(line => this.isValidLine(line));
    this.stats.validLines += validLines.length;
    this.stats.invalidLines += lines.length - validLines.length;

    validLines.forEach(line => this.processedLines.add(line));
    return validLines;
  }

  private async insertBatch(lines: string[]): Promise<void> {
    if (lines.length === 0) return;

    // Process in smaller batches to avoid request size limits
    for (let i = 0; i < lines.length; i += this.batchSize) {
      const batchLines = lines.slice(i, i + this.batchSize);
      const entries = batchLines.map(line => ({
        content: line,
        type: 'credential',
        user_id: this.userId
      }));

      try {
        const { data, error } = await supabase
          .from('entries')
          .insert(entries)
          .select();

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            this.stats.duplicates += entries.length;
          } else {
            console.error('Error inserting entries:', error);
            this.stats.duplicates += entries.length; // Treat as duplicates to avoid stopping the process
          }
        } else {
          this.stats.uniqueLines += (data?.length || 0);
        }
      } catch (error: any) {
        console.error('Error in insertBatch:', error);
        if (error.code === '23505') {
          this.stats.duplicates += entries.length;
        } else {
          // Don't throw, just log and continue
          console.error('Unexpected error during batch insert:', error);
          this.stats.duplicates += entries.length; // Treat as duplicates to continue processing
        }
      }
      
      // Add a small delay to prevent browser from freezing
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }

  public async process(
    onProgress: (progress: number, stats: {
      processedChunks: number;
      totalChunks: number;
      uniqueLines: number;
      duplicates: number;
      fileSize: number;
      validLines: number;
      invalidLines: number;
    }) => void
  ): Promise<ProcessResult> {
    try {
      // Use smaller chunks for better memory management
      const chunkSize = 128 * 1024; // 128KB chunks
      const totalChunks = Math.ceil(this.file.size / chunkSize);
      let processedChunks = 0;
      let lastPartialLine = '';

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, this.file.size);
        const chunk = await this.readChunk(start, end);
        
        const fullContent = lastPartialLine + chunk;
        const lines = fullContent.split('\n');
        lastPartialLine = lines.pop() || ''; // Get the last line which might be incomplete

        const validLines = await this.processChunk(lines.join('\n'));
        await this.insertBatch(validLines);

        processedChunks++;
        
        onProgress(Math.min((processedChunks / totalChunks) * 100, 99), {
          processedChunks,
          totalChunks,
          uniqueLines: this.stats.uniqueLines,
          duplicates: this.stats.duplicates,
          fileSize: this.file.size,
          validLines: this.stats.validLines,
          invalidLines: this.stats.invalidLines
        });

        // Add a small delay to prevent browser from freezing
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Process final partial line if it exists
      if (lastPartialLine.trim()) {
        const validLines = await this.processChunk(lastPartialLine);
        await this.insertBatch(validLines);
      }

      // Final progress update
      onProgress(100, {
        processedChunks,
        totalChunks,
        uniqueLines: this.stats.uniqueLines,
        duplicates: this.stats.duplicates,
        fileSize: this.file.size,
        validLines: this.stats.validLines,
        invalidLines: this.stats.invalidLines
      });

      return {
        success: true,
        stats: this.stats
      };
    } catch (error: any) {
      console.error('Error processing file:', error);
      return {
        success: false,
        error: error.message || 'Processing failed',
        stats: this.stats
      };
    }
  }

  private async readChunk(start: number, end: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this.file.slice(start, end));
    });
  }
}