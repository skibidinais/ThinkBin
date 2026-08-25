"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  href: string;
  iconSrc: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Beranda",
    href: "/dashboard",
    iconSrc: "/screens_assets/home.png",
  },
  {
    id: "belajar",
    label: "Belajar",
    href: "/belajar",
    iconSrc: "/screens_assets/learn.png",
  },
  {
    id: "leaderboard",
    label: "Peringkat",
    href: "/leaderboard",
    iconSrc: "/screens_assets/leaderboard.png",
  },
  {
    id: "toko",
    label: "Toko",
    href: "/toko",
    iconSrc: "/screens_assets/shop.png",
  },
  {
    id: "profil",
    label: "Profil",
    href: "/profil",
    iconSrc: "/screens_assets/profile.png",
  },
];

export const BottomDock: React.FC = () => {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    height: number;
  }>({ left: 0, width: 0, height: 0 });

  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname?.startsWith(item.href);
  });

  const currentActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  useEffect(() => {
    if (!containerRef.current) return;
    const navButtons = containerRef.current.querySelectorAll<HTMLAnchorElement>(".tb-dock-item");
    const activeBtn = navButtons[currentActiveIndex];

    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
        height: activeBtn.offsetHeight,
      });
    }
  }, [currentActiveIndex, pathname]);

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[390px] z-50 select-none">
      <div
        ref={containerRef}
        className="relative flex items-center justify-between w-full p-1.5 bg-[#7cbd73] border-[3.5px] border-[#65a35b] rounded-[36px] shadow-[0_8px_24px_rgba(101,163,91,0.35),0_2px_6px_rgba(0,0,0,0.1)]"
      >
        {/* Sliding Indicator Pill with [0.16, 1, 0.3, 1] ease-out-expo */}
        <div
          className="absolute top-[6px] bg-[#a3cca0] border-[2.5px] border-[#bce2b8] rounded-[24px] pointer-events-none transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            height: `${indicatorStyle.height}px`,
          }}
        />

        {/* 5 Nav Items */}
        {NAV_ITEMS.map((item, index) => {
          const isActive = index === currentActiveIndex;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`tb-dock-item relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-[24px] text-white font-fredoka font-bold text-[11px] text-center z-10 transition-opacity active:opacity-85 outline-none ${
                isActive ? "opacity-100" : "opacity-90 hover:opacity-100"
              }`}
            >
              <div className="relative w-8 h-8 flex items-center justify-center mb-0.5">
                <Image
                  src={item.iconSrc}
                  alt={item.label}
                  width={32}
                  height={32}
                  className="object-contain drop-shadow-sm"
                  priority
                />
              </div>
              <span className="leading-tight drop-shadow-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomDock;
