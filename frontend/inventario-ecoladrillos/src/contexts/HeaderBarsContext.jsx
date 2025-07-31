import { createContext, useState, useEffect, useContext, useRef } from "react";

export const HeaderBarsContext = createContext();

export const HeaderBarsProvider = ({ children }) => {
  const [barsClicked, setBarsClicked] = useState(false); // estado para saber si se ha hecho click en las barras

  const handleBarsClicked = () => {
    setBarsClicked(!barsClicked);
  };

  // si la ventana es mas grande que 767px, barsClicked es false
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767) {
        setBarsClicked(false);
      }
    };
    window.addEventListener("resize", handleResize);
    // Limpia el evento al desmontar el componente
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ------ NECESARIO PARA useClickOutside ------
  const [refsState, setRefsState] = useState([]); // almacenar las referencias de las que dependera useClickOutside

  // Función para registrar una nueva referencia
  const registerRef = (ref) => {
    // elimina las referencias que no son válidas
    setRefsState((prevRefs) => prevRefs.filter((ref) => ref && ref.current));

    // agregar ref a refsState si no existe
    if (ref && !refsState.includes(ref)) {
      setRefsState((prevRefs) => [...prevRefs, ref]);
    }
  };

  return (
    <HeaderBarsContext.Provider
      value={{
        barsClicked,
        setBarsClicked,
        handleBarsClicked,
        refsState,
        registerRef,
      }}
    >
      {children}
    </HeaderBarsContext.Provider>
  );
};

export const useHeaderBars = () => useContext(HeaderBarsContext);
