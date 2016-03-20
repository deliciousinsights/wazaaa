// UI de tagging
// =============
import $ from 'jquery'

import 'select2-bootstrap-theme/dist/select2-bootstrap.css'
import 'select2/dist/css/select2.css'

window.jQuery = $
require('select2/dist/js/select2.full')
require('select2/dist/js/i18n/fr')

// Activation de l'UI de tagging et fourniture des tags déjà connus
// pour tout champ de formulaire avec `name="tags"`.  Plus pro qu'une
// bête saisie textuelle.
$(initTagger)

function initTagger() {
  $('select[name="tags"]').each((i, field) => {
    field = $(field)
    field.select2({
      placeholder: 'tag, tag…',
      theme: 'bootstrap',
      tags: true,
      tokenSeparators: [',', ' '],
    })
  })
}
