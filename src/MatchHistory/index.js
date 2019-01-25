import React from 'react'
import styled from '@emotion/styled'
import { Box, Col, Grid, Row, th } from '@smooth-ui/core-em'
import prettyMs from 'pretty-ms'
import get from 'lodash.get'

const MatchWrapper = styled('li')`
  background-color: ${({ win, theme }) => (win ? theme.info : theme.danger)};
  border: 1px solid ${th('dark')};
  box-shadow: 0px 0px 1px 1px ${th('dark')};
  border-radius: 10px;
  cursor: default;
  display: flex;
  margin-bottom: 10px;
  padding: 10px 20px;
  @media (min-width: 600px) {
    flex-direction: column;
  }
`

const StyledImg = styled('img')`
  background-color: black;
  border: 1px solid ${th('dark')};
  border-radius: 50%;
  height: auto;
  max-width: 100%;
`
const Img = ({ src, alt }) => {
  return src ? <StyledImg src={src} alt={alt} /> : <span />
}

const Champion = styled(Box)`
  display: flex;
  justify-content: center;
  width: 100%;
  img {
    flex-grow: 1;
  }
`

const Spells = styled(Box)`
  display: flex;
  justify-content: center;
  img {
    flex-grow: 1;
  }
`

const Perks = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, auto);
  justify-content: center;
`

const PerkColumn = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const Text = styled('div')`
  white-space: nowrap;
  text-overflow: ellipsis;
`

const Match = ({ match }) => {
  const date = new Date(match.timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = date.getFullYear()
  const dateStr = `${month}/${day}/${year}`
  const duration = prettyMs(match.gameDuration * 1000)
  return (
    <MatchWrapper win={match.win}>
      <Grid>
        <Row>
          <Col sm={2} xs={12}>
            <Champion>
              <Img src={match.champion} alt={match.champion} />
            </Champion>
            <Spells>
              <Img src={match.spell1} alt={match.spell1} />
              <Img src={match.spell2} alt={match.spell2} />
            </Spells>
            <Box textAlign='center'>{match.win ? 'Victory' : 'Defeat'}</Box>
          </Col>

          <Col sm={3} xs={12}>
            <Perks>
              <PerkColumn>
                <Img src={match.keystone} alt={match.keystone} />
                <Img src={match.rune1} alt={match.rune1} />
                <Img src={match.rune2} alt={match.rune2} />
                <Img src={match.rune3} alt={match.rune3} />
              </PerkColumn>

              <PerkColumn>
                <Img src={match.rune4} alt={match.rune4} />
                <Img src={match.rune5} alt={match.rune5} />
              </PerkColumn>

              <PerkColumn>
                <Img src={match.statRune0} alt={match.statRune0} />
                <Img src={match.statRune1} alt={match.statRune1} />
                <Img src={match.statRune2} alt={match.statRune2} />
              </PerkColumn>
            </Perks>
          </Col>
          <Col sm={3} xs={12}>
            <div>{match.champName}</div>
            <div>Level: {match.champLevel}</div>
            <div>Date: {dateStr}</div>
            <div>Duration: {duration}</div>
            <div>{match.creepScore} CS</div>
            <div>
              {(match.creepScore / (match.gameDuration / 60)).toFixed(2)} CS/min
            </div>
            <div>Vision Score: {match.visionScore}</div>

            <div>
              <div>
                {match.kills} / {match.deaths} / {match.assists}
              </div>
              <div>{(match.kills + match.assists) / match.deaths} KDA</div>
              <div>Largest Multikill:{match.largestMultiKill}</div>
            </div>
          </Col>

          <Col sm={4} xs={12}>
            <Text style={{ fontWeight: 'bold' }}>Items:</Text>
            <Text>{get(match.item0, 'name', '')}</Text>
            <Text>{get(match.item1, 'name', '')}</Text>
            <Text>{get(match.item2, 'name', '')}</Text>
            <Text>{get(match.item3, 'name', '')}</Text>
            <Text>{get(match.item4, 'name', '')}</Text>
            <Text>{get(match.item5, 'name', '')}</Text>
            <Text>{get(match.item6, 'name', '')}</Text>
          </Col>
        </Row>
      </Grid>
    </MatchWrapper>
  )
}

const MatchList = styled('ul')`
  width: 100%;
`

const MatchHistory = ({ matches }) => {
  return (
    <MatchList>
      {matches.length > 0
        ? matches.map(match => <Match key={match.gameId} match={match} />)
        : 'No matches can be found. Try Again'}
    </MatchList>
  )
}

export default MatchHistory
