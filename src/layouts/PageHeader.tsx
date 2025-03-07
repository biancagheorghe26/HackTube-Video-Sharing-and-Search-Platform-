import { ArrowLeft, Search, Mic, Menu } from "lucide-react";
import { Button } from "../components/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../contexts/SidebarContext.tsx";
import React from "react";
import logo from "../assets/logo.jpeg";
import '../custom.d.ts';
// Importă componenta UserMenu
import { UserMenu } from "../components/UserMenu.tsx";

export function PageHeader() {
  const navigate = useNavigate();
  const [showFullWidthSearch, setShowFullWidthSearch] = useState(false);

  return (
    <div className="flex gap-10 lg:gap-20 justify-between pt-2 mb-6 mx-4">
      {/* Secțiunea din stânga */}
      <PageHeaderFirstSection hidden={showFullWidthSearch} />

      {/* Formularul de căutare */}
      <form
        className={`gap-4 flex-grow justify-center ${
          showFullWidthSearch ? "flex" : "hidden md:flex"
        }`}
      >
        {showFullWidthSearch && (
          <Button
            onClick={() => setShowFullWidthSearch(false)}
            type="button"
            size="icon"
            variant="ghost"
            className="flex-shrink-0"
          >
            <ArrowLeft />
          </Button>
        )}
        </form>
      {/* Secțiunea din dreapta */}
      <div
        className={`flex-shrink-0 md:gap-2 ${
          showFullWidthSearch ? "hidden" : "flex"
        }`}
      >
        {/* Înlocuiește butonul de login cu UserMenu */}
        <UserMenu />
      </div>
    </div>
  );
}

type PageHeaderFirstSectionProps = {
  hidden?: boolean;
};

export function PageHeaderFirstSection({
  hidden = false,
}: PageHeaderFirstSectionProps) {
  const { toggle } = useSidebarContext();

  return (
    <div
      className={`gap-4 items-center flex-shrink-0 ${
        hidden ? "hidden" : "flex"
      }`}
    >
      <Button onClick={toggle} variant="ghost" size="icon">
        <Menu />
      </Button>
      <a href="/">
        <img src={logo} className="h-6" />
        
      </a>
    </div>
  );
}
