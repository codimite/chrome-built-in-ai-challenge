import { useState, useEffect } from 'react'
import { BsMoonStars, BsGlobe, BsFillMoonStarsFill } from 'react-icons/bs'
import { MdOutlineOpenInNew } from 'react-icons/md'
import { GiSoapExperiment } from 'react-icons/gi'
import { TbStars } from 'react-icons/tb'
import { RiPenNibFill } from 'react-icons/ri'
import { IconContext } from 'react-icons'
import { IoMdOpen, IoIosClose } from 'react-icons/io'
import { FaArrowRight } from 'react-icons/fa'
import { LuMessagesSquare } from 'react-icons/lu'
import gif from '../assets/div-gif.gif'
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
  ActionIcon,
} from '@mantine/core'
import classes from './Popup.module.css'

export const Popup = () => {
  const [currentDomain, setCurrentDomain] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [nanoStatus, setNanoStatus] = useState<boolean | string>(false)
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light')

  // get the current active tab's domain

  useEffect(() => {
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

  // get the theme status

  useEffect(() => {
    chrome.storage.sync.get(['colorScheme']).then((res) => {
      if (res.colorScheme) {
        setColorScheme(res.colorScheme)
        console.log(`colorscheme set to ${res.colorScheme} when mounting`)
      }
    })
  }, [])

  // get the status of chrome flags
  useEffect(() => {
    const fetchGeminiStatus = async () => {
      const status = await checkGeminiStatus()
      setNanoStatus(status)
    }

    fetchGeminiStatus()
  }, [])

  // check gemini nano status
  const checkGeminiStatus = async () => {
    try {
      const capabilities = await ai.languageModel.capabilities()
      console.log('Gemini Nano Status:', capabilities.available ? 'readily' : false)
      return capabilities.available
    } catch (error) {
      console.error('Error checking Gemini Nano status:', error)
      return false
    }
  }

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

  // go to optimization flag handler
  const goToOptimizationFlag = () => {
    console.log('fired')
    window.location.href = 'chrome://flags'
  }

  const goToEnableDocs = () => {
    window.open('https://www.google.com', '_blank')
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

  const handlePopupClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <>
      <Card withBorder radius="md" p="md" className={classes.card}>
        <div
          className={classes.itemWrapper}
          style={{
            backgroundImage: `url(${gif})`,
            backgroundSize: '250%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '20% 45%',
          }}
        >
          {/* <Group className={classes.item} wrap="nowrap" gap="xs">
            <IconContext.Provider value={{ color: 'purple' }}>
              <RiPenNibFill size={25} />
            </IconContext.Provider>
            <div>
              <Text size=" 18px" fw="500">
                Intelliwrite
              </Text>
            </div>
            <div style={{ paddingLeft: '50px' }}>
              <IconContext.Provider value={{ color: 'purple' }}>
                <IoIosClose size={20} />
              </IconContext.Provider>
            </div>
          </Group> */}
          <Group
            className={classes.item}
            wrap="nowrap"
            gap="xs"
            style={{ justifyContent: 'space-between' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <IconContext.Provider value={{ color: 'white' }}>
                <RiPenNibFill size={25} />
              </IconContext.Provider>
              <Text size="18px" fw="500" style={{ color: 'white' }}>
                Intelliwrite
              </Text>
            </div>
            <div style={{ marginLeft: 'auto' }} onClick={handlePopupClose}>
              <IconContext.Provider value={{ color: 'white' }}>
                <IoIosClose size={25} />
              </IconContext.Provider>
            </div>
          </Group>
        </div>
        {/* check for chrome flags */}
        {nanoStatus === 'readily' ? (
          <>
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
          </>
        ) : (
          <>
            <Group justify="space-between" mt="md">
              <Text size="xs" fw={600}>
                Note:
              </Text>
            </Group>
            <Text size="xs" fw={400} mb={'xs'}>
              Please click on "Learn how to enable" to activate the required flags in chrome://flags
            </Text>

            <div className={classes.itemWrapper}>
              <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <IconContext.Provider value={{ color: 'purple' }}>
                    <GiSoapExperiment size={25} />
                  </IconContext.Provider>
                  <div>
                    <Text fw="500" size="xs">
                      Prompt API for Gemini Nano
                    </Text>
                  </div>
                </div>
                <div>
                  {nanoStatus === 'readily' ? (
                    <Text fw="500" size="xs">
                      Enabled
                    </Text>
                  ) : (
                    <Text fw="500" size="xs" style={{ color: 'grey' }}>
                      Disabled
                    </Text>
                  )}
                </div>
              </Group>
            </div>
            <div className={classes.itemWrapper}>
              <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <IconContext.Provider value={{ color: 'purple' }}>
                    <GiSoapExperiment size={25} />
                  </IconContext.Provider>
                  <div>
                    <Text fw="500" size="xs">
                      Optimization Guide On Device
                    </Text>
                  </div>
                </div>
                <div>
                  {nanoStatus === 'readily' ? (
                    <Text fw="500" size="xs">
                      Enabled
                    </Text>
                  ) : (
                    <Text fw="500" size="xs" style={{ color: 'grey' }}>
                      Disabled
                    </Text>
                  )}
                </div>
              </Group>
            </div>
          </>
        )}

        <Card.Section withBorder>
          <Group style={{ justifyContent: 'flex-start' }} mt="xs" mb="xs" ml="lg">
            <Text size="xs" fw={600} style={{ cursor: 'pointer' }} onClick={goToEnableDocs}>
              Learn How To Enable
              <FaArrowRight size={14} style={{ paddingLeft: '2px', paddingTop: '5px' }} />
            </Text>
          </Group>
        </Card.Section>
      </Card>
    </>
  )
}

export default Popup
