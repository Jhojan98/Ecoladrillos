import { useEffect } from "react";
// saber si el usuario ha hecho click fuera del componente o ha presionado Escape
export function useClickOutside(refs, onClickOutside) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        refs.every((ref) => ref.current && !ref.current.contains(event.target))
      ) {
        onClickOutside();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClickOutside();
      }
    };

    document.addEventListener("mouseup", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [refs, onClickOutside]);
}
