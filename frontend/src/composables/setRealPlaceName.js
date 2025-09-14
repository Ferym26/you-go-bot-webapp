import { places } from '../data/places'

export const setRealPlaceName = value => {
	return places.find(place => place.value === value).label;
}
