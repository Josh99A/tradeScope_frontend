"use client"
import { useState } from "react";

const MobileMenu = () => {

const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="md:hidden rounded-md border border-ts-border p-2"
      aria-label="Open menu"
    >
      ☰
    </button>

  )
}

export default MobileMenu
