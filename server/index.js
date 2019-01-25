if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const path = require('path')
const Hapi = require('hapi')
const inert = require('inert')
const LeagueJS = require('leaguejs')
const DDragon = require('leaguejs/lib/DataDragon/DataDragonHelper')
const get = require('lodash.get')

const VERSION = '9.1.1'
const IMG_URL = `/static-data/`
// const IMG_URL_CHAMP = `${IMG_URL}champions/`
const IMG_URL_CHAMP = `http://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/`
// const IMG_URL_SPELL = `${IMG_URL}spells/`
const IMG_URL_SPELL = `http://ddragon.leagueoflegends.com/cdn/${VERSION}/img/spell/`
const IMG_URL_RUNES = `${IMG_URL}runes/`

const leaguejs = new LeagueJS(process.env.LEAGUE_API_KEY, {
  useV4: true,
  caching: {
    isEnabled: true,
  },
})

const server = Hapi.server({
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
})

// logging on server response
server.events.on('response', req => {
  console.log(
    req.method.toUpperCase(),
    req.url.pathname,
    req.response.statusCode,
  )
})

server.ext('onPreResponse', (request, h) => {
  const response = request.response
  if (!response.isBoom) {
    return h.continue
  }
  return []
})

// GET route for API
server.route({
  method: 'GET',
  path: '/api/{user?}',
  config: {
    cors: {
      origin: ['*'],
      additionalHeaders: ['cache-control', 'x-requested-with'],
    },
  },
  handler: async (req, h) => {
    if (req.params.user !== '') {
      // resolve summoner info
      const sumInfo = await leaguejs.Summoner.gettingByName(req.params.user)
        .then(data => data)
        .catch(err => console.error(err))

      // resolve matchList info
      const matchListInfo = await leaguejs.Match.gettingListByAccount(
        sumInfo.accountId,
        process.env.LEAGUE_API_PLATFORM_KEY,
        {
          beginIndex: 0,
          endIndex: 10,
        },
      )
        .then(res => res)
        .catch(err => console.error(err))

      // get matchInfo
      const matchListWithSummonerInfo = await Promise.all(
        matchListInfo.matches.map(async match => {
          // fill out match information
          const matchInfo = await leaguejs.Match.gettingById(match.gameId)
            .then(res => {
              const partId = res.participantIdentities.find(
                id => id.player.accountId === sumInfo.accountId,
              )

              const participant = res.participants.find(
                participant =>
                  participant.participantId === partId.participantId,
              )

              const didWin = res.teams.find(
                team => team.teamId === participant.teamId,
              ).win

              return {
                ...match,
                item0: participant.stats.item0,
                item1: participant.stats.item1,
                item2: participant.stats.item2,
                item3: participant.stats.item3,
                item4: participant.stats.item4,
                item5: participant.stats.item5,
                item6: participant.stats.item6,
                champLevel: participant.stats.champLevel,
                creepScore:
                  participant.stats.totalMinionsKilled +
                  participant.stats.neutralMinionsKilled,
                visionScore: participant.stats.visionScore,
                largestMultiKill: participant.stats.largestMultiKill,
                spell1Id: participant.spell1Id,
                spell2Id: participant.spell2Id,
                keystoneTypeId: participant.stats.perkPrimaryStyle,
                subRuneTypeId: participant.stats.perkSubStyle,
                keystoneId: participant.stats.perk0,
                rune1Id: participant.stats.perk1,
                rune2Id: participant.stats.perk2,
                rune3Id: participant.stats.perk3,
                rune4Id: participant.stats.perk4,
                rune5Id: participant.stats.perk5,
                statRune0: participant.stats.statPerk0
                  ? DDragon.getPerkImageUrl(participant.stats.statPerk0)
                  : '',
                statRune1: participant.stats.statPerk1
                  ? DDragon.getPerkImageUrl(participant.stats.statPerk1)
                  : '',
                statRune2: participant.stats.statPerk2
                  ? DDragon.getPerkImageUrl(participant.stats.statPerk2)
                  : '',
                kills: participant.stats.kills,
                assists: participant.stats.assists,
                deaths: participant.stats.deaths,
                gameDuration: res.gameDuration,
                win: didWin === 'Win' ? true : false,
              }
            })
            .catch(err => console.error(err))

          // fill out match formation with champion data
          const matchWithChamps = await DDragon.gettingChampionsList()
            .then(res => {
              const champName = res.keys[matchInfo.champion]
              return {
                ...matchInfo,
                champName,
                champion: `${IMG_URL_CHAMP}${champName}.png`,
              }
            })
            .catch(err => console.error(err))

          // fill out match formation with summoner spell data
          const matchWithSummonerSpellsInfo = await DDragon.gettingSummonerSpellsList()
            .then(res => {
              const summonerSpellMap = Object.keys(res.data).reduce(
                (init, key) => {
                  init[res.data[key].id] = key
                  return init
                },
                {},
              )

              return {
                ...matchWithChamps,
                // teams,
                spell1: `${IMG_URL_SPELL}${
                  summonerSpellMap[matchInfo.spell1Id]
                }.png`,
                spell2: `${IMG_URL_SPELL}${
                  summonerSpellMap[matchInfo.spell2Id]
                }.png`,
              }
            })
            .catch(err => console.error(err))

          // fill out match formation with rune data
          const matchWithRunesReforged = await DDragon.gettingReforgedRunesList()
            .then(res => {
              const runesMap = res.reduce((init, rune) => {
                init[rune.id] = rune
                rune.slots.forEach(slot =>
                  slot.runes.forEach(rune => (init[rune.id] = rune)),
                )
                return init
              }, {})

              return {
                ...matchWithSummonerSpellsInfo,
                keystone: `${IMG_URL_RUNES}${get(
                  runesMap,
                  [matchInfo.keystoneId, 'icon'],
                  '',
                )}`,
                rune1: `${IMG_URL_RUNES}${get(
                  runesMap,
                  [matchInfo.rune1Id, 'icon'],
                  '',
                )}`,
                rune2: `${IMG_URL_RUNES}${get(
                  runesMap,
                  [matchInfo.rune2Id, 'icon'],
                  '',
                )}`,
                rune3: `${IMG_URL_RUNES}${get(
                  runesMap,
                  [matchInfo.rune3Id, 'icon'],
                  '',
                )}`,
                rune4: `${IMG_URL_RUNES}${get(
                  runesMap,
                  [matchInfo.rune4Id, 'icon'],
                  '',
                )}`,
                rune5: `${IMG_URL_RUNES}${get(
                  runesMap,
                  [matchInfo.rune5Id, 'icon'],
                  '',
                )}`,
              }
            })
            .catch(err => console.error(err))

          // fill out match formation with item data
          const matchWithItems = await DDragon.gettingItemList()
            .then(res => {
              return {
                ...matchWithRunesReforged,
                item0: res.data[matchInfo.item0],
                item1: res.data[matchInfo.item1],
                item2: res.data[matchInfo.item2],
                item3: res.data[matchInfo.item3],
                item4: res.data[matchInfo.item4],
                item5: res.data[matchInfo.item5],
                item6: res.data[matchInfo.item6],
              }
            })
            .catch(err => console.error(err))

          return matchWithItems
        }),
      )

      return matchListWithSummonerInfo
    }
    return []
  },
})

// init server, serve react application
const init = async () => {
  await server.register(inert)

  // route for react build
  await server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../build/'),
        redirectToSlash: true,
        index: true,
        listing: false,
      },
    },
  })

  // // route for static champion assets
  // await server.route({
  //   method: 'GET',
  //   path: '/static-data/champions/{path*}',
  //   handler: {
  //     directory: {
  //       path: path.join(
  //         __dirname,
  //         '../static_data/dragontail-9.1.1/9.1.1/img/champion/',
  //       ),
  //       redirectToSlash: true,
  //       index: true,
  //       listing: false,
  //     },
  //   },
  // })

  // // route for static spell assets
  // await server.route({
  //   method: 'GET',
  //   path: '/static-data/spells/{path*}',
  //   handler: {
  //     directory: {
  //       path: path.join(
  //         __dirname,
  //         '../static_data/dragontail-9.1.1/9.1.1/img/spell',
  //       ),
  //       redirectToSlash: true,
  //       index: true,
  //       listing: false,
  //     },
  //   },
  // })

  // route for static runes assets
  await server.route({
    method: 'GET',
    path: '/static-data/runes/{path*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../static_data/'),
        redirectToSlash: true,
        index: true,
        listing: false,
      },
    },
  })

  // // route for static item assets
  // await server.route({
  //   method: 'GET',
  //   path: '/static-data/items/{path*}',
  //   handler: {
  //     directory: {
  //       path: path.join(
  //         __dirname,
  //         '../static_data/dragontail-9.1.1/9.1.1/img/item/',
  //       ),
  //       redirectToSlash: true,
  //       index: true,
  //       listing: false,
  //     },
  //   },
  // })

  await server.start()

  // download static data
  DDragon.downloadingStaticDataByLocale('en_US', ['9.1.1'])
    .then(success => console.log('worked'))
    .catch(err => console.error(err))

  console.log(server.info.uri)
}

process.on('unhandledRejection', err => {
  console.log(err)
  process.exit(1)
})

init()
