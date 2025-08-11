'use client';

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function MobileMenuButton() {
  const handleToggleSidebar = () => {
    document.dispatchEvent(new CustomEvent('toggleSidebar'));
  };

  return (
    <div className="md:hidden mb-4">
      <Button variant="ghost" size="icon" onClick={handleToggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
}
