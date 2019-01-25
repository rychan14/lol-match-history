import React, { Component } from 'react'
import styled from '@emotion/styled'
import {
  Box,
  Button as SmoothButton,
  Col,
  Input as SmoothInput,
  Label,
  Row,
} from '@smooth-ui/core-em'
// import debounce from 'lodash.debounce'
import LoadingEllipsis from '../LoadingEllipsis'

const Input = styled(SmoothInput)`
  border-radius: 5px;
  width: 100%;
`
const Button = styled(SmoothButton)`
  width: 100%;
`

class SearchInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }
    // this.fetchBySummonerName = debounce(this.fetchBySummonerName, 800)
  }

  // fetchBySummonerName = value => this.props.setMatchHistory(value)
  handleOnChange = ({ target: { value } }) => {
    this.setState({ value })
  }
  handleOnClick = e => {
    e.preventDefault()
    this.props.setMatchHistory(this.state.value)
  }

  render() {
    const { isLoading } = this.props
    const { handleOnClick, handleOnChange } = this
    return (
      <form>
        <Label htmlFor='summonerName'>Summoner Name:</Label>
        <Row>
          <Col sm={10} xs={12}>
            <Input onChange={handleOnChange} />
          </Col>
          <Col sm={2} xs={12}>
            <Button
              type='submit'
              onClick={handleOnClick}
              disabled={isLoading}
              height='100%;'
            >
              {isLoading ? (
                <Box display='flex' justifyContent='center'>
                  <LoadingEllipsis />
                </Box>
              ) : (
                'Search'
              )}
            </Button>
          </Col>
        </Row>
      </form>
    )
  }
}

export default SearchInput
