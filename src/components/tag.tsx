import React, { ReactNode } from "react";

const Tag = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-fit rounded-full border border-[#ee2c05] bg-[#ee2c05]/10 px-1.5 py-0.5 text-xs font-medium">
      {children}
    </div>
  );
};

export default Tag;
