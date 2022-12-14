import { Box, Heading, HStack, VStack, Text, Center } from '@chakra-ui/react'
import { getDate } from 'date-fns'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import IntegrateFrontend from './IntegrateFrontend'
import LinkButton from './LinkButton/LinkButton'

function DeploymentCard(props) {
  const [status, setStatus] = useState('')
  const router = useRouter()
  let bg = 'black'
  let textColor = 'white'
  let item = props.item
  let endTime = item?.endTime * 1000
  let type = props.type
let Key=props.Key;
  function navigateToExplore() {
    router.push('/Explore')
  }
  function getSaleStatus() {
    let timeNow = new Date().getTime()
    let message = type == 'whitelist' ? 'Ends in ' : 'Ends in'

    if (endTime > timeNow) {
      message +=
        '' + new Date(endTime - timeNow).toISOString().substr(11, 8).toString()
    } else {
      message = 'Ended ! '
    }
    setStatus(message)
  }
  function getDate(unixTime) {
    if (!unixTime) return 'Fetching..'
    // console.log("Unix Time got ",unixTime)
    return new Date(Number(unixTime * 1000)).toISOString().split('T')[0]
  }
  function getMinimalAddress(adr) {
    if (!adr) return 'Fetching..'
    return adr.slice(0, 6) + '..' + adr.slice(38)
  }

  useEffect(() => {
    const id = setInterval(() => {
      getSaleStatus()
    }, 1000)
  }, [])
  return (
    <>
      <VStack
        key={'deployment' + item?.name+Key}
        border={'1px solid grey'}
        borderRadius={'20px'}
        padding={['10px', '20px', '20px']}
        bg={bg}
        textColor={textColor}
        width={['50vw', '45vw', '35vw','30vw','20vw']}
        height={'fit-content'}
        spacing={5}
        minW={"250px"}
        align={"center"}
      >
        <VStack  justify={"center"} height={['5vh', '8vh', '14vh']}>
          <Heading
            fontSize={['20px', '24px', '30px']}
            textTransform={'capitalize'}
            fontWeight={"900"}
          >
            {item?.name ? item?.name : 'Fetching..'}
          </Heading>
        </VStack>
        <Text>
          <b>Address</b> : {getMinimalAddress(item?.address)}
        </Text>
        <Text>
          <b>Created on </b> : {getDate(item?.startTime)}
        </Text>
        <Text>
          {' '}
          <b>Status </b> : {status}
        </Text>

        {item?.website ? (
          <LinkButton
            title={'View Deployment'}
            color={'green'}
            href={item?.website}
            loadingMessage={'none'}
          />
        ) : (
          <LinkButton
            title={'Integrate Frontend'}
            color={'white'}
            variant={'outline'}
            onClick={() => {
              navigateToExplore()
            }}
            loadingMessage={'none'}
          />
        )}
      </VStack>
    </>
  )
}

export default DeploymentCard
