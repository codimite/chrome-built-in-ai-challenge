import { useState, useEffect } from 'react'
import { IconSun, IconMoonStars } from '@tabler/icons-react'
import {
  useComputedColorScheme,
  useMantineColorScheme,
  useMantineTheme,
  Switch,
  rem,
  Text,
  Group,
  Card,
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

  const toggleColorScheme = () => {
    console.log('dark mode fired')
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }

  const toggleForWebsite = () => {
    console.log('website toggle clicked')
  }

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
    <Card withBorder radius="md" p="xl" className={classes.card}>
      <Text fz="lg" className={classes.title} fw={500}>
        Intellawrite
      </Text>
      <Text fz="xs" c="dimmed" mt={3} mb="xl">
        Testing desc
      </Text>
      {items}
    </Card>
  )
}

export default Popup
