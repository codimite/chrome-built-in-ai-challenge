import { useState, useEffect } from 'react'
import { BsMoonStars, BsGlobe, BsFillMoonStarsFill } from 'react-icons/bs'
import { IconContext } from 'react-icons'
import {
  useComputedColorScheme,
  useMantineColorScheme,
  useMantineTheme,
  Switch,
  rem,
  Text,
  Group,
  Card,
  ThemeIcon,
  Paper,
  Image,
} from '@mantine/core'
import classes from './Popup.module.css'

export const Popup = () => {
  const [currentDomain, setCurrentDomain] = useState('')
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light')

  useEffect(() => {
    //get the current active tab's domain
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url)
          setCurrentDomain(url.origin)
        } catch (error) {
          console.log('invalid url for current tab: ', tabs[0].url)
        }
      }
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.get(['colorScheme']).then((res) => {
      if (res.colorScheme) {
        setColorScheme(res.colorScheme)
        console.log(`colorscheme set to ${res.colorScheme} when mounting`)
      }
    })
  }, [])

  //toggling options for user
  const toggleColorScheme = () => {
    console.log('dark mode fired')
    const updatedColorScheme = computedColorScheme === 'dark' ? 'light' : 'dark'
    setColorScheme(updatedColorScheme)
    chrome.storage.sync.set({ colorScheme: updatedColorScheme }).then(() => {
      console.log(`setting into chrome storage sync colorScheme ${updatedColorScheme}`)
    })
    console.log('updated color scheme: ', updatedColorScheme)
  }

  const toggleForWebsite = () => {
    console.log('website toggle clicked')
    chrome.storage.sync.get(['colorScheme']).then((res) => {
      console.log(`value from storage is ${res.colorScheme}`)
    })
  }

  //toggling content
  const optionsForUser = [
    {
      title: 'Dark Mode',
      description: 'Enjoy a sleek and comfotable experience',
      action: toggleColorScheme,
    },
    {
      title: 'This Website  ',
      description: currentDomain || 'This Website',
      action: toggleForWebsite,
    },
  ]

  //user options items
  const items = optionsForUser.map((item) => (
    <div className={classes.itemWrapper} key={item.title}>
      <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
        <div>
          <Text fw="500">{item.title}</Text>
          <Text size="xs" c="dimmed">
            {item.description}
          </Text>
        </div>
        <Switch
          onLabel="ON"
          offLabel="OFF"
          className={classes.switch}
          size="sm"
          color="grape"
          onClick={item.action}
        />
      </Group>
    </div>
  ))

  //   const [darkMode, setDarkMode] = useState(false);
  //   const TODO: need to implement logic -> dictionary to disable for specific websites

  //   const toggleDarkMode = () => {
  //     console.log('toggleDarkMode popup clicked');
  //     const newDarkMode = !darkMode;
  //     setDarkMode(newDarkMode);
  //     chrome.storage.sync.set({ darkMode: newDarkMode });
  //     // chrome.runtime.sendMessage({ type: 'DARK_MODE_TOGGLE', darkMode: newDarkMode });//TODO: add better name for DARK_MODE_TOGGLE
  //   };

  //   useEffect(() => {
  //     chrome.storage.sync.get(['darkMode'], (result) => {//TODO: add better name for darkMode
  //       setDarkMode(result.darkMode || false);
  //     });
  //   }, []);

  return (
    <>
      <Card withBorder radius="md" p="md" className={classes.card}>
        <div className={classes.itemWrapper}>
          <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
            <div>
              <Text fw="500">Get Started</Text>
            </div>
          </Group>
        </div>

        <div className={classes.itemWrapper}>
          <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <IconContext.Provider value={{ color: 'purple' }}>
                {colorScheme === 'light' ? (
                  <BsMoonStars size={20} />
                ) : (
                  <BsFillMoonStarsFill size={20} />
                )}
              </IconContext.Provider>
              <div>
                <Text fw="500"> Dark Mode</Text>
                <Text size="xs" c="dimmed">
                  Enjoy a sleek and comfotable experience
                </Text>
              </div>
            </div>
            {colorScheme === 'light' ? (
              <ThemeIcon
                variant="gradient"
                size="lg"
                aria-label="Gradient action icon"
                gradient={{ from: 'violet', to: 'cyan', deg: 90 }}
              >
                <BsMoonStars size={20} />
              </ThemeIcon>
            ) : (
              <ThemeIcon
                variant="gradient"
                size="lg"
                aria-label="Gradient action icon"
                gradient={{ from: 'grey', to: 'black', deg: 90 }}
              >
                <BsFillMoonStarsFill size={20} />
              </ThemeIcon>
            )}

            <Switch
              onLabel="ON"
              offLabel="OFF"
              className={classes.switch}
              size="md"
              color="grape"
              onClick={toggleColorScheme}
              checked={colorScheme === 'dark'}
            />
          </Group>
        </div>

        <div className={classes.itemWrapper}>
          <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <IconContext.Provider value={{ color: 'purple' }}>
                <BsGlobe size={20} />
              </IconContext.Provider>
              <div>
                <Text fw="500">This Website</Text>
                <Text size="xs" c="dimmed">
                  {currentDomain}
                </Text>
              </div>
            </div>
            <Switch
              onLabel="ON"
              offLabel="OFF"
              className={classes.switch}
              size="md"
              color="grape"
              onClick={toggleForWebsite}
            />
          </Group>
        </div>
      </Card>
    </>
  )
}

export default Popup
