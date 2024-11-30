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
import intelliwriteLogo from '../assets/int-blue-34.png'
import { MESSAGE_ACTIONS } from '../constants'
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
  const [extensionStatus, setExtensionsStatus] = useState<boolean>(false)
  const [promptApiStatus, setPromptApiStatus] = useState<boolean | string>(false)
  const [rewriterApiStatus, setRewriterApiStatus] = useState<boolean | string>(false)
  const [summarizerApiStatus, setSummarizerApiStatus] = useState<boolean | string>(false)
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light')

  const darkmode_dark = chrome.runtime.getURL('img/darkmode-dark.png')
  const darkmode_light = chrome.runtime.getURL('img/darkmode-light.png')
  const enable_light = chrome.runtime.getURL('img/enable-light.png')
  const enable_dark = chrome.runtime.getURL('img/enable-dark.png')

  // get the current active tab's domain

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url)
          const hostname = url.hostname

          chrome.storage.sync.get(['disabledWebsites'], (result) => {
            const disabledWebsites = result.disabledWebsites || []
            const isCurrentlyDisabled = disabledWebsites.includes(hostname)
            setExtensionsStatus(!isCurrentlyDisabled) // Set setExtensionsStatus to represent the site's enabled/disabled state
          })
        } catch (error) {
          console.error('Invalid URL for current tab: ', tabs[0].url)
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
    const fetchApiStatus = async () => {
      chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.IS_APIS_READY }, (response) => {
        console.log('response from background script:', response)
        setPromptApiStatus(response.prompt)
        setRewriterApiStatus(response.rewriter)
        setSummarizerApiStatus(response.summarizer)
      })
    }

    fetchApiStatus()
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url)
          const hostname = url.hostname

          // Get the current disabled list and toggle the current site's state
          chrome.storage.sync.get(['disabledWebsites'], (result) => {
            const disabledWebsites = result.disabledWebsites || []
            const isCurrentlyDisabled = disabledWebsites.includes(hostname)

            if (isCurrentlyDisabled) {
              // Remove from disabled list
              const updatedList = disabledWebsites.filter((site: string) => site !== hostname)
              chrome.storage.sync.set({ disabledWebsites: updatedList }, () => {
                console.log(`${hostname} enabled`)
                setExtensionsStatus(true) // Update NanoStatus to reflect the current state
              })
            } else {
              // Add to disabled list
              disabledWebsites.push(hostname)
              chrome.storage.sync.set({ disabledWebsites }, () => {
                console.log(`${hostname} disabled`)
                setExtensionsStatus(false) // Update NanoStatus to reflect the current state
              })
            }
          })
        } catch (error) {
          console.error('Invalid URL for current tab: ', tabs[0].url)
        }
      }
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

  const areAllApisReady =
    promptApiStatus === true && rewriterApiStatus === true && summarizerApiStatus === true

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
              <Image src={intelliwriteLogo} height={30} />

              {/* <IconContext.Provider value={{ color: 'white' }}>
                <RiPenNibFill size={25} />
              </IconContext.Provider> */}
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
        {areAllApisReady ? (
          <>
            <div className={classes.itemWrapper}>
              <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <IconContext.Provider value={{ color: 'purple' }}>
                    {colorScheme === 'light' ? (
                      //   <BsMoonStars size={20} />
                      <Image src={darkmode_light} h={30} w={30} />
                    ) : (
                      //   <BsFillMoonStarsFill size={20} />
                      <Image src={darkmode_dark} h={30} w={30} />
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
                    {/* <BsGlobe size={20} /> */}
                    {colorScheme === 'light' ? (
                      <Image src={enable_light} h={30} w={30} />
                    ) : (
                      <Image src={enable_dark} h={30} w={30} />
                    )}
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
                  checked={extensionStatus} // Reflect current state
                />
              </Group>
            </div>

            <Group justify="space-between" mt="md">
              <Text size="xs" fw={600}>
                About:
              </Text>
            </Group>
            <Text size="xs" fw={400} mb={'xs'}>
              IntelliWrite is an advanced AI-powered tool that helps you easily rewrite content
              while protecting sensitive information.
            </Text>
            <Card.Section withBorder>
              <Group style={{ justifyContent: 'flex-end' }} mt="xs" mb="xs">
                <Text
                  size="xs"
                  fw={600}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '2px',
                  }}
                  onClick={goToEnableDocs}
                >
                  <TbStars size={14} style={{ paddingTop: '1px' }} />
                  Rate Us
                </Text>
                <Text
                  size="xs"
                  fw={600}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '2px',
                    paddingRight: '20px',
                  }}
                  onClick={goToEnableDocs}
                >
                  <LuMessagesSquare size={14} style={{ paddingTop: '1px' }} />
                  Feedback
                </Text>
              </Group>
            </Card.Section>
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
                      Prompt API
                    </Text>
                  </div>
                </div>
                <div>
                  {promptApiStatus ? (
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
                      Rewriter API
                    </Text>
                  </div>
                </div>
                <div>
                  {rewriterApiStatus ? (
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
                      Summarizer API
                    </Text>
                  </div>
                </div>
                <div>
                  {summarizerApiStatus ? (
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

            <Card.Section withBorder>
              <Group style={{ justifyContent: 'flex-start' }} mt="xs" mb="xs" ml="lg">
                <Text size="xs" fw={600} style={{ cursor: 'pointer' }} onClick={goToEnableDocs}>
                  Learn How To Enable
                  <FaArrowRight size={14} style={{ paddingLeft: '2px', paddingTop: '5px' }} />
                </Text>
              </Group>
            </Card.Section>
          </>
        )}
      </Card>
    </>
  )
}

export default Popup
