
(function($) {
  
  var fixtureCount=0;
  
    function cleanup(sanitizer, fixtureName) {
      fixtureCount++;
      var clean = sanitizer.clean(document.getElementById(fixtureName));
      var result = $('<div id="result-'+fixtureCount+'"></div>').appendTo($('#resultHTML'));
      return result.append(clean);
    }
    
  test('Default settings return only text nodes', function() {
      var s = new Sanitizer();
      var result = cleanup(s, 'paragraph');
      
      equal($('p', result).length, 0, 'All paragraphs are removed');
      equal($.trim(result.text()), 'A Paragraph', 'Text remains');
      equal(result.contents().length, 1, 'Contains only one text node');
      
  });

  test('Whitelisted elements remain, other elements are removed', function() {
      var s = new Sanitizer({elements:['p']});
      var result = cleanup(s, 'smallexample');
      equal($('p', result).length, 2, 'All paragraphs remain');
      equal($('em', result).length, 0, 'Emphasis removed');
      equal($('a', result).length, 0, 'Link removed');
  });
  
  test('Whitelisted attributes are preserved, other attributes are removed', function() {
      var s = new Sanitizer({elements:['p'], attributes:{p:['class']}});
      var result = cleanup(s, 'attributes');
      equal($('p[class]', result).length, 2, 'All class attributes of paragraphs remain');
      equal($('p[id]', result).length, 0, 'ID attribute is removed');
  });
  
  test('Comments can be preserved', function(){
      var s = new Sanitizer();
      var result = cleanup(s, 'entitiesAndComments');
      equal(result.contents().length, 1, 'Comment node is removed');
      var s = new Sanitizer({allow_comments:true});
      var result = cleanup(s, 'entitiesAndComments');
      var comments = $.grep(result.contents(), function(elem){return elem.nodeType == 8});
      equal(comments.length, 1, 'Comment node is preserved');
  });

  test('Attributes with protocols that are not allowed are removed', function() {
      var options = {
        elements:['a'],
        attributes:{a:['href']},
        protocols:{ 
          a: { href: ['http'] }
        }
      }
      var s = new Sanitizer(options);
      var result = cleanup(s, 'protocolLinks');
      equal($("a[href^='http://']", result).length, 1, 'HTTP protocol is preserved');
      equal($("a[href^='chrome://']", result).length, 0, 'chrome protocol is removed');
      equal($("a[href^='file://']", result).length, 0, 'file protocol is removed');
      equal($("a[href^='../']", result).length, 0, 'relative path is removed');
      equal($("a[href^='javascript']", result).length, 0, 'javascript is removed');
  });
  
  test('Attributes with protocols that are allowed are preserved', function() {
      var options = {
        elements:['a'],
        attributes:{a:['href']},
        protocols:{ 
          a: { href: ['http', 'file', Sanitizer.RELATIVE] }
        }
      }
      var s = new Sanitizer(options);
      var result = cleanup(s, 'protocolLinks');
      equal($("a[href^='http://']", result).length, 1, 'HTTP protocol is preserved');
      equal($("a[href^='chrome://']", result).length, 0, 'chrome protocol is removed');
      equal($("a[href^='file://']", result).length, 1, 'file protocol is removed');
      equal($("a[href^='../']", result).length, 1, 'relative path is removed');
      equal($("a[href^='javascript']", result).length, 0, 'javascript is removed');
  });
  
  test('Attributes are added', function() {
      var options = {
        elements:['a'],
        attributes:{a:['href']},
        add_attributes:{ 
          a: { rel: 'nofollow' }
        }
      }
      var s = new Sanitizer(options);
      var result = cleanup(s, 'protocolLinks');
      equal($("a[rel]", result).length, 5, 'rel attribute is added');
  });

})(jQuery);
    