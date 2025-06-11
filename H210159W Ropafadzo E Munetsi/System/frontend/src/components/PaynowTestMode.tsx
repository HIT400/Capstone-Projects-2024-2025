import React from 'react';

interface PaynowTestModeProps {
  isVisible: boolean;
}

const PaynowTestMode: React.FC<PaynowTestModeProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Paynow Test Mode is Active
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              You can use the following test accounts to simulate payments:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Test Email:</strong> any-email@testuser.com</li>
              <li><strong>EcoCash Test:</strong> 0771111111</li>
              <li><strong>OneMoney Test:</strong> 0772222222</li>
              <li><strong>InnBucks Test:</strong> 0774444444</li>
            </ul>
            <p className="mt-2">
              <strong>Note:</strong> No real money will be charged when using these test accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaynowTestMode;
