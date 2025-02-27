export interface EntryStats {
  total_entries: number;
  unique_domains: number;
  unique_users: number;
  latest_upload: string;
  entries_last_24h: number;
}

export interface DomainStat {
  domain_name: string;
  entry_count: number;
}

export interface UserStat {
  username: string;
  count: number;
}

export interface UserStats {
  total_unique_users: number;
  most_common_users: UserStat[];
}

export interface LoginStats {
  total_logins: number;
  new_logins_24h: number;
  existing_logins_24h: number;
  new_vs_existing_ratio: number;
}