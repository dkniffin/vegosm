import pizzaIcon from '@material-design-icons/svg/outlined/local_pizza.svg'
import cafeIcon from '@material-design-icons/svg/outlined/local_cafe.svg'
import ramenIcon from '@material-design-icons/svg/outlined/ramen_dining.svg'
import kebabIcon from '@material-design-icons/svg/outlined/kebab_dining.svg'
import riceBowlIcon from '@material-design-icons/svg/outlined/rice_bowl.svg'
import setMealIcon from '@material-design-icons/svg/outlined/set_meal.svg'
import bentoIcon from '@material-design-icons/svg/outlined/bento.svg'
import lunchIcon from '@material-design-icons/svg/outlined/lunch_dining.svg'
import dinnerIcon from '@material-design-icons/svg/outlined/dinner_dining.svg'
import bakeryIcon from '@material-design-icons/svg/outlined/bakery_dining.svg'
import barIcon from '@material-design-icons/svg/outlined/local_bar.svg'
import icecreamIcon from '@material-design-icons/svg/outlined/icecream.svg'
import tapasIcon from '@material-design-icons/svg/outlined/tapas.svg'
import restaurantIcon from '@material-design-icons/svg/outlined/restaurant.svg'

export const CUISINES = {
  "pizza":        { icon: pizzaIcon },
  "burger":       { icon: dinnerIcon },
  "coffee_shop":  { icon: cafeIcon },
  "regional":     { icon: restaurantIcon },
  "chinese":      { icon: riceBowlIcon },
  "italian":      { icon: restaurantIcon },
  "sandwich":     { icon: lunchIcon },
  "chicken":      { icon: dinnerIcon },
  "mexican":      { icon: restaurantIcon },
  "japanese":     { icon: setMealIcon },
  "kebab":        { icon: kebabIcon },
  "indian":       { icon: restaurantIcon },
  "american":     { icon: dinnerIcon },
  "sushi":        { icon: bentoIcon },
  "asian":        { icon: riceBowlIcon },
  "thai":         { icon: ramenIcon },
  "seafood":      { icon: restaurantIcon },
  "french":       { icon: bakeryIcon },
  "korean":       { icon: riceBowlIcon },
  "ice_cream":    { icon: icecreamIcon },
  "greek":        { icon: tapasIcon },
  "barbecue":     { icon: restaurantIcon },
  "german":       { icon: barIcon },
  "bubble_tea":   { icon: cafeIcon },
  "steak_house":  { icon: dinnerIcon },
  "vietnamese":   { icon: ramenIcon },
  "noodle":       { icon: ramenIcon },
  "fish_and_chips": { icon: restaurantIcon },
  "tex-mex":      { icon: restaurantIcon },
  "turkish":      { icon: kebabIcon },
}

export const DEFAULT_ICON = restaurantIcon

export const VALID_CUISINES = Object.keys(CUISINES)

export const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000

export const TILE_ZOOM = 12

export const OVERPASS_QUERY = '(node["diet:vegan"]["diet:vegan"!="no"]({{bbox}});node["diet:vegetarian"]["diet:vegetarian"!="no"]({{bbox}}););out geom;'
