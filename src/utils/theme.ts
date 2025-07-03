import { useState, useEffect } from 'react';

/**
 * 查询当前主题颜色
 * @param query 查询条件
 * @returns 是否匹配
 */
const useMediaQuery = (query: string) => {
  const media = window.matchMedia(query);
  return media.matches;
  // const [matches, setMatches] = useState(false);
  // useEffect(() => {
  //   const media = window.matchMedia(query);
  //   if (media.matches !== matches) {
  //     setMatches(media.matches);
  //   }
  // }, [matches, query]);

  // return matches;
};

const useTheme = () => {
  const darkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [theme, setTheme] = useState(darkMode ? 'dark' : 'light');

  useEffect(() => {
    console.log('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // 主题修改时自动同步
    const dark = function (mediaQueryList: any) {
      if (mediaQueryList.matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    };
    const light = function (mediaQueryList: any) {
      if (mediaQueryList.matches) {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', dark);
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', light);

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', dark);
      window.matchMedia('(prefers-color-scheme: light)').removeEventListener('change', light);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    // document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  return { theme, toggleTheme };
};

export { useMediaQuery, useTheme };
