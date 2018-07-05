import React from 'react'
import {
  Container,
} from 'reactstrap';
import { Link } from 'react-router-dom'

const Loading = () => (

  <Container className='home'>
    <br/>
    <br/>
    <img src={require('../images/pacman.gif')} alt="packman" />
    <br/>
    Loading...
    <br/>
    <br/>

    <span>If you see this screen for long time, please sign in again <Link to="/">here</Link>.</span>
  </Container>

)

export default Loading
