import workers from './workers'
import generate from './generations/generate'
import generation from './generations/generation'
import twitter from './auth/social/twitter'

export default [
  workers,
  generate,
  generation,
  twitter
]
