/* global $, Cookies, Mousetrap */

/*! momo.zhimingwang.org | ui.js v1 | MIT/Expat */

$(function () {
  var $window = $(window)
  var $document = $(document)

  $.fn.extend({
    onScreen: function () {
      if (this.length === 0) {
        return false
      }
      var viewportTop = $window.scrollTop()
      var viewportBottom = viewportTop + $window.height()
      var top = this.offset().top
      var bottom = top + this.height()
      return (top >= viewportTop && top < viewportBottom) ||
        (bottom > viewportTop && bottom <= viewportBottom) ||
        (top <= viewportTop && bottom >= viewportBottom)
    },
    scrollTo: function () {
      if (this.length > 0) {
        $window.scrollTop(this.offset().top - 30)
      }
      return this
    },
    prevStatus: function () {
      return this.prevAll('.status').first()
    },
    nextStatus: function () {
      return this.nextAll('.status').first()
    },
    highlight: function () {
      if (this.length > 0) {
        // Dehighlight other highlighted elements first
        $('.highlight').removeClass('highlight')
        this.first().addClass('highlight')
      }
      return this
    },
    dehighlight: function () {
      this.removeClass('highlight')
      return this
    }
  })

  var topVisibleStatus = function () {
    var viewportTop = $window.scrollTop()
    var viewportBottom = viewportTop + $window.height()
    return $('.status').filter(function () {
      var top = this.offsetTop
      var bottom = top + this.offsetHeight
      return (top >= viewportTop && top < viewportBottom) ||
        (top <= viewportTop && bottom >= viewportBottom)
    }).first()
  }

  var bottomVisibleStatus = function () {
    var viewportTop = $window.scrollTop()
    var viewportBottom = viewportTop + $window.height()
    return $('.status').filter(function () {
      var top = this.offsetTop
      var bottom = top + this.offsetHeight
      return (bottom > viewportTop && bottom <= viewportBottom) ||
        (top <= viewportTop && bottom >= viewportBottom)
    }).last()
  }

  // Scroll to last recorded position
  $window.scrollTop(Cookies.get('scroll'))

  // Lazyload, if applicable
  $('img.lazy').lazyload({
    threshold: 800,
    // Smallest possible PNG file
    // https://kidsreturn.org/2011/04/smallest-possible-1x1-transparent-gif-and-png/
    // http://garethrees.org/2007/11/14/pngcrush/
    placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
  })

  // Fancybox
  // Add data-fancybox-group to fancybox images
  $('.status').each(function (i, e) {
    $(e).find('.gallery a.fancybox').attr('data-fancybox-group', $(e).attr('id'))
  })

  // On /gallery, link all gallery images to the same group
  $('.gallery.standalone a.fancybox').attr('data-fancybox-group', 'g')

  $('.fancybox').fancybox({
    nextClick: false,
    nextEffect: 'none',
    padding: 0,
    prevEffect: 'none',
    keys: {
      prev: [65, 188, 37], // a, ','/<, left
      next: [68, 190, 39], // d, '.'/>, right
      close: [27, 79, 81] // esc, o, q
    },
    helpers: {
      overlay: {
        locked: false
      }
    },
    beforeLoad: function () {
      if (window.location.pathname.match(/\/gallery(\.html)?/)) {
        var date = this.element.attr('data-date').replace(/(\d{4})-(\d{2})-(\d{2})/, '$1年$2月$3日')
        var url = this.element.attr('data-status-url')
        this.title = `<a href="${url}" target="_blank">${date}</a>`
      } else {
        this.title = (this.index + 1) + ' / ' + this.group.length
      }
      Mousetrap.pause()
    },
    afterShow: function () {
      $('img.fancybox-image').wrap(function () {
        return $('<a></a>', {href: this.src, target: '_blank'})
      })
      $document.off('keypress.fancybox-open-original')
      $document.on('keypress.fancybox-open-original', function (e) {
        var key = String.fromCharCode(e.which)
        switch (key) {
          case 'O':
            $('img.fancybox-image').closest('a').get(0).click()
            break
        }
      })
    },
    beforeClose: function () {
      $document.off('keypress.fancybox-open-original')
    },
    afterClose: function () {
      Mousetrap.unpause()
    }
  })

  // Gif overlay
  $('.fancybox[href$=".gif"]').append($('<div class="gif-indicator">GIF</div>'))

  // Register click actions
  $('.back-to-top').click(function () {
    $window.scrollTop(0)
  })

  $('.status').click(function () {
    $(this).highlight()
  })

  $document.click(function (e) {
    var clickedTag = e.target.tagName.toLowerCase()
    if (clickedTag === 'html' || clickedTag === 'body') {
      $('.status.highlight').dehighlight()
    }
  })

  // Keyboard shortcuts
  // Unregister g *
  for (var ch = 97; ch <= 122; ch++) {
    Mousetrap.bind('g ' + String.fromCharCode(ch), null)
  }
  // g A => /all
  Mousetrap.bind('g A', function () {
    window.location = '/all'
  })
  // G, b => bottom
  Mousetrap.bind(['G', 'b'], function () {
    $window.scrollTop($document.height())
    return false
  })
  // g g, t => top
  Mousetrap.bind(['g g', 't'], function () {
    $window.scrollTop(0)
    return false
  })
  // a, ',', <, left => previous page
  Mousetrap.bind(['a', ',', '<', 'left'], function () {
    var prev = $('.prev a').get(0)
    if (prev.click) {
      prev.click()
    }
    return false
  })
  // d, '.', >, right => next page
  Mousetrap.bind(['d', '.', '>', 'right'], function () {
    var next = $('.next a').get(0)
    if (next.click) {
      next.click()
    }
    return false
  })
  // j, k / s, w => highlight and navigate
  Mousetrap.bind(['s', 'j'], function () {
    var $highlighted = $('.status.highlight')
    if ($highlighted.length === 0) {
      topVisibleStatus().highlight().scrollTo()
    } else {
      $highlighted.nextStatus().highlight().scrollTo()
    }
    return false
  })
  Mousetrap.bind(['w', 'k'], function () {
    var $highlighted = $('.status.highlight')
    if ($highlighted.length === 0) {
      bottomVisibleStatus().highlight().scrollTo()
    } else {
      $highlighted.prevStatus().highlight().scrollTo()
    }
    return false
  })
  // o => open image
  Mousetrap.bind('o', function () {
    var $highlighted = $('.status.highlight')
    // Open image in currently highlighted status if the status is currently on screen
    if ($highlighted.length > 0 && $highlighted.onScreen()) {
      $highlighted.find('.gallery a').first().click()
      return
    }
    // Open the first at least 3/4 visible image (and highlight the corresponding status)
    var viewportTop = $window.scrollTop()
    var viewportBottom = viewportTop + $window.height()
    var img = $('.gallery a').filter(function () {
      var top = this.offsetTop
      var bottom = top + this.offsetHeight
      return top >= viewportTop - 30 && bottom <= viewportBottom + 30
    }).first()
    if (img.length === 0) {
      return
    }
    img.closest('.status').highlight()
    img.click()
  })

  // Record scroll position upon unload
  $window.on('unload', function () {
    Cookies.set('scroll', $window.scrollTop(), {path: window.location.pathname})
  })
})
