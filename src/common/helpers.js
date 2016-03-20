// Helpers partagés serveur/client
// ===============================
import moment from 'moment'

import 'moment/locale/fr'

moment.locale('fr')

function populateHelpers(helpers) {
  Object.assign(helpers, {
    // Formatage de date/heure sur format libre, avec un format long
    // comme défaut.  On peut aussi lui passer une entité équipée d'un
    // champ `postedAt` (bookmark, commentaire) qui sera alors utilisé.
    formatDate(d = new Date(), format = 'dddd D MMMM YYYY à HH:mm') {
      d = d.postedAt || d

      return moment(d).format(format)
    },

    // Pluraliseur basique FR, la forme plurielle étant optionnelle
    // (si elle n'est pas fournie, on ajoutera un "s" au singulier).
    pluralize(count, singular, plural) {
      const term = count > 1 ? plural || singular + 's' : singular
      return `${count} ${term}`
    },
  })
}

export default populateHelpers
