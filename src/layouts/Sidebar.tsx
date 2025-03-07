import { ElementType, ReactNode } from "react";
import { Link } from "react-router-dom";  // Import Link
import { twMerge } from "tailwind-merge";
import { Clapperboard, Home, Library } from "lucide-react";
import { useSidebarContext } from "../contexts/SidebarContext.tsx";
import React from "react";

// Define SmallSidebarItem component
type SmallSidebarItemProps = {
  Icon: ElementType;
  title: string;
  url: string;
};

function SmallSidebarItem({ Icon, title, url }: SmallSidebarItemProps) {
  return (
    <Link to={url} className="py-4 px-1 flex flex-col items-center rounded-lg gap-1">  {/* Use Link here */}
      <Icon className="w-6 h-6" />
      <div className="text-sm">{title}</div>
    </Link>
  );
}

export function Sidebar({ toggleUploadForm }: { toggleUploadForm: () => void }) {
  const { isLargeOpen, isSmallOpen, close } = useSidebarContext();

  return (
    <>
      {/* Sidebar pentru dispozitive mici */}
      <aside
        className={`sticky top-0 overflow-y-auto scrollbar-hidden pb-4 flex flex-col ml-1 ${
          isLargeOpen ? "lg:hidden" : "lg:flex"
        }`}
      >
        <SmallSidebarItem Icon={Home} title="Home" url="/" />
        <SmallSidebarItem Icon={Clapperboard} title="Subscriptions" url="/subscriptions" />
        <SmallSidebarItem Icon={Library} title="Library" url="/library" />
        <SmallSidebarItem Icon={Clapperboard} title="History" url="/history" /> {/* Added History */}
        {/* Butonul pentru postare */}
        <button
          onClick={toggleUploadForm}
          className="py-4 px-1 flex flex-col items-center rounded-lg gap-1 mt-4"
        >
          <Clapperboard className="w-6 h-6" />
          <div className="text-sm">Postează Video</div>
        </button>
      </aside>

      {/* Background pentru închiderea meniului mic */}
      {isSmallOpen && (
        <div
          onClick={close}
          className="lg:hidden fixed inset-0 z-[999] bg-secondary-dark opacity-50"
        />
      )}

      {/* Sidebar pentru dispozitive mari */}
      <aside
        className={`w-56 lg:sticky absolute top-0 overflow-y-auto scrollbar-hidden pb-4 flex-col gap-2 px-2 ${
          isLargeOpen ? "lg:flex" : "lg:hidden"
        } ${isSmallOpen ? "flex z-[999] bg-white max-h-screen" : "hidden"}`}
      >
        <LargeSidebarSection>
          <LargeSidebarItem IconOrImgUrl={Home} title="Home" url="/" />
          <LargeSidebarItem IconOrImgUrl={Clapperboard} title="Subscriptions" url="/subscriptions" />
        </LargeSidebarSection>
        <hr />
        <LargeSidebarSection>
          <LargeSidebarItem IconOrImgUrl={Library} title="Library" url="/library" />
          <LargeSidebarItem IconOrImgUrl={Clapperboard} title="History" url="/history" /> {/* Added History */}
          {/* Butonul pentru postare */}
          <LargeSidebarItem
            IconOrImgUrl={Clapperboard}
            title="Postează Video"
            onClick={toggleUploadForm}
            url="#"
          />
        </LargeSidebarSection>
      </aside>
    </>
  );
}

type LargeSidebarSectionProps = {
  children: ReactNode;
};

function LargeSidebarSection({ children }: LargeSidebarSectionProps) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

type LargeSidebarItemProps = {
  IconOrImgUrl: ElementType | string;
  title: string;
  url: string;
  isActive?: boolean;
  onClick?: () => void;
};

function LargeSidebarItem({
  IconOrImgUrl,
  title,
  url,
  isActive = false,
  onClick,
}: LargeSidebarItemProps) {
  return (
    <Link
      to={url}  // Use Link here
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={twMerge(
        `w-full flex items-center rounded-lg gap-4 p-3 ${
          isActive ? "font-bold bg-neutral-100 hover:bg-secondary" : undefined
        }`
      )}
    >
      {typeof IconOrImgUrl === "string" ? (
        <img src={IconOrImgUrl} className="w-6 h-6 rounded-full" />
      ) : (
        <IconOrImgUrl className="w-6 h-6" />
      )}
      <div className="whitespace-nowrap overflow-hidden text-ellipsis">{title}</div>
    </Link>
  );
}
