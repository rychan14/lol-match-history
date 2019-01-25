import React, { Component } from 'react'
import { Global, css } from '@emotion/core'
import { Box, Col, Grid, Normalize, Row } from '@smooth-ui/core-em'
import { Subscribe, Container } from 'unstated'
import SearchInput from './SearchInput'
import MatchHistory from './MatchHistory'
import LoadingEllipsis from './LoadingEllipsis'

let controller, signal

const fetchMatchList = summonerName => {
  if (controller !== undefined) {
    controller.abort()
  }

  controller = new AbortController()
  signal = controller.signal
  const config = {
    method: 'GET',
    signal: signal,
    headers: {
      Accept: 'application/json',
    },
  }

  return fetch(`/api/${summonerName}`, config)
    .then(res => res.json())
    .catch(err => {
      if (err.name === 'AbortError') {
        console.log('aborted')
        return []
      }
      console.error(err)
    })
}

class StateContainer extends Container {
  state = {
    isLoading: false,
    summonerName: '',
    matches: [],
  }

  setMatches = async summonerName => {
    await this.setState({ isLoading: !this.state.isLoading, summonerName })
    const matches = await fetchMatchList(summonerName)
    await this.setState({ matches, isLoading: !this.state.isLoading })
  }
}

class App extends Component {
  render() {
    return (
      <>
        <Global
          styles={css`
            ul,
            li {
              list-style-type: none;
              padding: 0;
            }
          `}
        />
        <Normalize />
        <Subscribe to={[StateContainer]}>
          {globalState => (
            <Grid>
              <Row justifyContent='center'>
                <Col xs={12}>
                  <SearchInput
                    id='summonerName'
                    setMatchHistory={globalState.setMatches}
                    isLoading={globalState.state.isLoading}
                  />
                </Col>
              </Row>

              <Row justifyContent='center'>
                <Col xs={12} display='inline-flex' justifyContent='center'>
                  <Box>{globalState.state.summonerName}</Box>
                </Col>
              </Row>
              <Row justifyContent='center'>
                <Col xs={12} display='inline-flex' justifyContent='center'>
                  {globalState.state.isLoading ? (
                    <Box justifyContent='center' width='80px' m={2}>
                      <LoadingEllipsis />
                    </Box>
                  ) : (
                    <MatchHistory
                      isLoading={globalState.state.isLoading}
                      matches={globalState.state.matches}
                    />
                  )}
                </Col>
              </Row>
            </Grid>
          )}
        </Subscribe>
      </>
    )
  }
}

export default App
