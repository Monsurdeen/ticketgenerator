export const saveToLocalStorage = (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };
  
  export const getFromLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch {
          localStorage.removeItem(key);
          return null;
        }
    }
    return null;
  };
  