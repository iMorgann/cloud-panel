import React from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CryptoAddressProps {
  icon: React.ReactNode;
  name: string;
  address: string;
  iconColor: string;
}

const CryptoAddress: React.FC<CryptoAddressProps> = ({ icon, name, address, iconColor }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-gray-700/50 p-3 rounded-lg border border-gray-600"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={iconColor}>{icon}</span>
          <span className="text-sm font-medium text-gray-300">{name}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="text-xs px-3 py-1.5 rounded transition-colors bg-gray-600 hover:bg-gray-500 text-gray-300"
        >
          <span>Copy Address</span>
        </motion.button>
      </div>
      <div className="text-xs font-mono text-gray-400 break-all bg-gray-800/50 p-2 rounded">
        {address}
      </div>
    </motion.div>
  );
};

export const PaymentOptions: React.FC = () => {
  return (
    <div className="space-y-4 pt-2">
      <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
      <div className="rounded-xl bg-gray-800/50 p-4 border border-gray-700">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Payment Options</h3>
        <div className="grid gap-3">
          <CryptoAddress
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-bitcoin"
              >
                <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
              </svg>
            }
            name="Bitcoin (BTC)"
            address="bc1q78jk24l3uty88xgy26vatam45rqkah4e48fgyt"
            iconColor="text-[#F7931A]"
          />
          <CryptoAddress
            icon={
              <svg
                className="text-[#345D9D]"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m7.5 12.5 2.5-2.5M10 10l4-4M10.5 15.5l7-7M14 14l2 2M8.5 15.5l2 2" />
              </svg>
            }
            name="Litecoin (LTC)"
            address="Li58G7aCyg1pLqBLifftyk6bhJ3CwQeBmt"
            iconColor="text-[#345D9D]"
          />
          <CryptoAddress
            icon={
              <svg
                className="text-[#627EEA]"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v8l6 2.5M12 10l-6 2.5M12 10v12M12 2l6 10.5M12 2L6 12.5M12 22l6-9.5M12 22l-6-9.5" />
              </svg>
            }
            name="Ethereum (ETH)"
            address="0x7db54642c6FB4Db5998f2ff9a160A4Ecf457364a"
            iconColor="text-[#627EEA]"
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            After payment, contact administrator via{' '}
            <a
              href="https://signal.group/#CjQKIAcsyHBpjnSs7sGtHAeFQZ4POv_jIhq0uSg0qPQBGvQfEhBE_jObOFCUm0LD9z2moy66"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Signal
            </a>
            {' '}to receive your access key
          </p>
        </div>
      </div>
    </div>
  );
};