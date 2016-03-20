import $ from 'jquery'

import 'select2-bootstrap-theme/dist/select2-bootstrap.css'
import 'select2/dist/css/select2.css'

window.jQuery = $
require('select2/dist/js/select2.full')
require('select2/dist/js/i18n/fr')

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
