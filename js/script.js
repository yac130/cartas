var ec = {
    config:{
        urlData: '/especiales/cartas/data/data.json',
        urlEditor:'editor.html',
        urlVisor:'visor.html',
        $wrap: $('#wrap_videos'),
        $editor : $('#editor_video'),
        $visor : $('#visor_video'),
    },
    data:null,
    utils: {
        eventBind: function(obj){
            var stoped = true, trigger, param, $element;
                if (!obj.element.jquery){
                stoped = obj.event.stopPropagation ? true : false;
                if (obj.event.stopPropagation) obj.event.stopPropagation();
                else {
                stoped = false;
                if (obj.event.cancelBubble) obj.event.cancelBubble = true;
                }
                if (obj.event.preventDefault) obj.event.preventDefault();
                else  obj.event.returnValue = false;

                $element = $(obj.element);
                if (typeof obj.callback == "function") param = obj.callback({element: $element, mom: $element});
                new ec[obj.ui](param.mom);
                if (stoped) {
                  trigger = param.element.data('event')||'click.ui';
                  param.element.trigger(trigger);
                };
                return true
            }
            return false;
        },
        findId: function(idToLookFor) {
        
            for (var i = 0; i < ec.data.length; i++) {
                if (ec.data[i].id == idToLookFor) {
                    return(ec.data[i]);
                }
            }
        }
    }
};


ec.init = function(){
    $.get(ec.config.urlData, function(data){
        ec.data = data.videos;
        if(ec.config.$wrap.length === 1)  ec.renderGrid();
        if(ec.config.$editor.length === 1) ec.renderEditor();
        if(ec.config.$visor.length === 1) ec.renderVisor();
    },'json');
}

ec.renderEditor = function(){
    var editorId = "mytextarea", id = $.urlParam('vid'), item = ec.utils.findId(id);

    function binner(){

        ec.config.$editor.on('submit', function(event){
             event.preventDefault ? event.preventDefault() : event.returnValue = false;
             var htmlEditor = encodeURIComponent(tinymce.get(editorId).getContent());
             $.post(ec.config.$editor.attr('action'), {vid: id, htmlText: htmlEditor} , function(data){
                if(data.success){
                    var html = ['<div class="box-confirmacion"><p>Tu mensaje fue enviado correctamente</p>',
                    '<a href="index.html">Enviar otro</a> <a href="'+ ec.config.urlVisor +'?vid='+ id +'&html='+ htmlEditor +'">Ver mensaje</a></div>'].join('');
                    ec.popupOb(html);
                }
             },'json');
        });
    }

    // colocar aca los campos que se desea agregar

    var html = ['<input type="hidden" name="vid" value="'+ id +'" >',
    '<h2>'+ item.titulo +'</h2>',
    '<div class="box-video"><video width="570" height="621" controls poster="'+ item.cover +'"><source src="'+ item.video +'" type="video/mp4"></video></div>',
    '<div class="row"><span class="lab">De:</span><input type="text" name="correo1" placeholder="Correo Electronico"></div>',
    '<div class="row"><span class="lab">Para:</span><input type="text" name="correo2" placeholder="Correo Electronico"></div>',
    '<div class="editor"><textarea id="'+ editorId +'"></textarea></div><button>Enviar</button>'].join('');

    ec.config.$editor.html(html);
    binner();

    tinymce.init({
      selector: '#'+editorId,
       menubar: false,
       toolbar: false
    });

}

ec.renderVisor = function(){
    var id = $.urlParam('vid'), htmlText = decodeURIComponent($.urlParam('html')), item = ec.utils.findId(id);
    var html = ['<div class="video-inner">',
            '<h2>'+ item.titulo +'</h2>',
            '<div class="videoHtml"><video poster="'+ item.cover +'" width="570" height="621" controls><source src="'+ item.video +'" type="video/mp4"></video></div>',
            '<div class="caption-text">'+ htmlText +'</div>',
            '</div>'].join('');
    ec.config.$visor.html(html);
}

 
ec.renderGrid = function(){
    var html = "";
    $.each(ec.data, function(ix){
      html += ['<div class="bloque-item">',
          '<div class="item-anima">',
            '<figure>',
               '<a href="#" onclick="ec.getPreview(this, event)" data-id="'+ ec.data[ix].id +'">',
                  '<img src="'+ ec.data[ix].cover +'" alt="">',
                '</a>',
                '<figcaption>',  
                  '<h3>'+ ec.data[ix].titulo +'</h3>',
                '</figcaption>',
            '</figure>',
          '</div>',
        '</div>'].join('');
    });

    ec.config.$wrap.html(html);
}

ec.getPreview = function(element, event){
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    var $element = $(element), item = ec.utils.findId( $element.data('id'));

    var html = ['<div class="video-popup">',
    '<h3>'+item.titulo+'</h3>',
    '<video width="570" height="621" controls poster="'+ item.cover +'"><source src="'+ item.video +'" type="video/mp4"></video>',
    '<div class="footer-video"><a href="'+ (ec.config.urlEditor +"?vid="+ item.id) +'">seleccionar tarjeta</a></div>',
    '</div>'].join('');

    $element.data('content', html);
    var p = new ec.popup(element, event);
    //$element.trigger("click");
}


ec.popupOb = function(element, callback){
           
    var $element = $(element), $popup, $inner, $to, isBody, $win = $(window), autocenter=true, $bk, clickTap = 'click' ;
    
    var center = function(init){
        if(isBody) $('body').addClass('ui-popup-on');
        else $('html,body').animate({scrollTop:  parseInt ($to.offset().top) },'slow','quint');
        $popup.css({
            width: isBody ? $win.width() : $to.outerWidth(true),
            height: isBody ? $win.height(): $to.outerHeight(true),
            position:isBody?'fixed':'absolute'
        });
        $popup.show();
        if (autocenter){
            var top = ((isBody ? nc.fn.dim('Height','min') : $to.outerHeight(true))-$inner.outerHeight(true))/2;
            if (init) $inner.css({top: -$inner.outerHeight(true)});
            $inner.css({
            left:'50%', transform: 'translateX(-50%)'
            }).animate({top:top>0?top:0},'quint');
        }
    }
 
    $bk = $('<div>'+element+'</div>');

    var suffix = $element.data('suffix')||false;
        $to = $($element.data('to')||'body');
        isBody = $to.is('body');

        $popup = $([
            '<div class="ui-popup-draw'+(suffix?' ui-popup-'+suffix:'')+'">',
            '<div class="ui-inner">',
            '<a href="#close" class="ui-close"><i class="icon-close"></i></a>',
            '</div>',
            '</div>'
        ].join(''));
            $inner = $popup.hide().find('.ui-inner').append($bk.removeClass('hide'));
            $to.append($popup);
              
            //$popup.find('.ui-close').on(clickTap,remove);

            autocenter = $element.data('center')==false?false:true;
            center(true);
              

            $element.trigger('onrender',$popup);

        

            if (isBody) $win.on('smartresize.ui',function(){
                
                center();
            }); else $to.css('position','relative');
            //});

            if(typeof callback === 'function') callback($bk);     
}


  ec.popup = function(element, event){
            
            var $element = element, $popup, $inner, $to, isBody, $win = $(window), autocenter=true, $bk, clickTap = 'click' ;
            if (ec.utils.eventBind({element:element, event:event, ui:"popup", callback:function(obj){
              if (event.type == "tap") {
                obj.element.data('event',event.type);
                obj.element.off(event.type);
              }else  obj.element.removeAttr('onclick');
              return obj;
            }})) return false;

              var dim = function(prop, m) {
                  m = m || 'max';
                  return Math[m](
                      Math[m](document.body["scroll" + prop], document.documentElement["scroll" + prop]),
                      Math[m](document.body["offset" + prop], document.documentElement["offset" + prop]),
                      Math[m](document.body["client" + prop], document.documentElement["client" + prop])
                  )
              }

            var center = function(init){
              if(isBody) $('body').addClass('ui-popup-on');
              else $('html,body').animate({scrollTop:  parseInt ($to.offset().top) },'slow');
              $popup.css({
                width: isBody ? $win.width() : $to.outerWidth(true),
                height: isBody ? $win.height(): $to.outerHeight(true),
                position:isBody?'fixed':'absolute'
              });
              $popup.show();
              if (autocenter){

                var top = ((isBody ? dim('Height','min') : $to.outerHeight(true))-$inner.outerHeight(true))/2;
                if (init) $inner.css({top: -$inner.outerHeight(true)});
                $inner.css({
                  //left:((isBody? $('body').width() : $to.outerWidth(true)) - $inner.width())/2
                  left:'50%', transform: 'translateX(-50%)'
                }).animate({top:top>0?top:0});
              }
            }

            var remove = function(e){
              if (e) $.event.fix(e).preventDefault();
             
              $popup.fadeOut('fast', function(){ $popup.remove()});
              $win.off('smartresize.ui');
              $win.off('keydown.ui');
              $('body').removeClass('ui-popup-on');
            }

            $element.on(($element.data('event')||'click')+'.ui',function(e){
              e.preventDefault();
              e.stopPropagation();
              var $cpch;
              if ($element.data('content').substring(0,1)=="#"){
                $bk = $bk || $($element.data('content')).clone(true);
                $($element.data('content')).remove();
              }else $bk = $('<div>'+$element.data('content')+'</div>');

              $cpch = $bk.find('.img-captcha');
              if ($cpch.length>0) $cpch.attr('src',$cpch.data('src')+'?rnd='+Math.random().toString().substring(2));

              var suffix = $element.data('suffix')||false;
              $to = $($element.data('to')||'body');
              isBody = $to.is('body');

              $popup = $([
                '<div class="ui-popup-draw'+(suffix?' ui-popup-'+suffix:'')+'">',
                  '<div class="ui-inner">',
                    '<a href="#close" class="ui-close"><i class="icon-close"></i></a>',
                  '</div>',
                '</div>'
              ].join(''));
              $inner = $popup.hide().find('.ui-inner').append($bk.clone(true).removeClass('hide'));
              $to.append($popup);
              $popup.on(clickTap,function(e){
                e.stopPropagation();
                if ($(e.target).is('.ui-popup-draw')) {
                  e.preventDefault();
                  if (e.gesture)e.gesture.stopPropagation(),e.gesture.preventDefault();
                  remove();
                }
              });
              $popup.find('.ui-close').on(clickTap,remove);

              autocenter = $element.data('center')==false?false:true;
              center(true);
              

              $element.trigger('onrender',$popup);

              $win.on('keydown.ui',function(e){
                if(e.keyCode == 27) remove();
              });

              if (isBody) $win.on('smartresize.ui',function(){
                if ($inner.children('.rsp-menu').length>0 && $(window).width()>1024 ) return remove();
                center();
              }); else $to.css('position','relative');
            });

     
          }

 
   ec.init();



;(function(window,$,undefined){
    'use strict';var $event=$.event,resizeTimeout;
    $event.special.smartresize={setup:function(){$(this).bind("resize",$event.special.smartresize.handler)},teardown:function(){$(this).unbind("resize",$event.special.smartresize.handler)},handler:function(event,execAsap){var context=this,args=arguments;event.type="smartresize";if(resizeTimeout){clearTimeout(resizeTimeout)}resizeTimeout=setTimeout(function(){$event.dispatch.apply(context,args)},execAsap==="execAsap"?0:100)}};
 $.fn.smartresize=function(fn){return fn?this.bind("smartresize",fn):this.trigger("smartresize",["execAsap"])};
})(window,jQuery);


$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}


// menu

function myFunction() {
    var x = document.getElementById("topNav");
        if (x.className === "menu") {
            x.className += " responsive";
        } else {
            x.className = "menu";
    }
}

