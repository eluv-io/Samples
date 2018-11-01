' ********** Copyright 2016 Roku Corp.  All Rights Reserved. **********

' Called when the HeroScreen component is initialized
sub Init()
  'Uncomment the print statements to see where and when the functions are called
  print "HeroScreen.brs - [init]"

  'Get references to child nodes
  m.RowList       =   m.top.findNode("RowList")
  m.background    =   m.top.findNode("Background")

  'Create a task node to fetch the UI content and populate the screen
  m.LibrariesTask = CreateObject("roSGNode", "LibrariesTask")
  m.LibrariesTask.observeField("content", "onLibrariesChanged")

  m.UriHandler = CreateObject("roSGNode", "UriHandler")
  m.UriHandler.observeField("content", "onContentChanged")

  print m.global.QFAB_URL_LIBS
  url = m.global.QFAB_URL_LIBS
  makeLibrariesRequest(url,"LibrariesParser")

  'Create observer events for when content is loaded
  m.top.observeField("visible", "onVisibleChange")
  m.top.observeField("focusedChild", "OnFocusedChildChange")
end sub

sub makeLibrariesRequest(url as String, ParserComponent as String)
  print "HeroScreen.brs - [makeLibrariesRequest]"
  context = createObject("roSGNode", "Node")
  print "Requesting content from: "; url; "\n"
  params = { uri: url }
  context.addFields({
    parameters: params,
    response: {}
  })
  m.LibrariesTask.request = {
    context: context,
    parser: ParserComponent
  }
end sub

' Issues a URL request to the UriHandler component
sub makeRequest(libs as object, ParserComponent as String)
  'print "HeroScreen.brs - [makeRequest]"
  m.UriHandler.numRows = libs.count()
  for i = 0 to libs.count() - 1
    context = createObject("roSGNode", "Node")
    libUrl = m.global.QFAB_URL_LIBS + "/" + libs[i].id + "/q"
    params = { uri: libUrl,
            meta: libs[i].meta
          }
    print "Requesting content from: "; params.meta.name; "\n"
    if type(params) = "roAssociativeArray"
      context.addFields({
        parameters: params,
        num: i,
        response: {}
      })
      m.UriHandler.request = {
        context: context
        parser: ParserComponent
      }
    end if
  end for
end sub

' observer function to handle when content loads
sub onLibrariesChanged()
  print "HeroScreen.brs - [onLibrariesChanged]"
  print m.LibrariesTask.content
  makeRequest(m.LibrariesTask.content, "Parser")
end sub

' observer function to handle when content loads
sub onContentChanged()
  print "HeroScreen.brs - [onContentChanged]"
  m.top.numBadRequests = m.UriHandler.numBadRequests
  m.top.content = m.UriHandler.content
  print m.content
end sub

' handler of focused item in RowList
sub OnItemFocused()
  'print "HeroScreen.brs - [onItemFocused]"
  itemFocused = m.top.itemFocused

  'When an item gains the key focus, set to a 2-element array,
  'where element 0 contains the index of the focused row,
  'and element 1 contains the index of the focused item in that row.
  if itemFocused.Count() = 2 then
    focusedContent            = m.top.content.getChild(itemFocused[0]).getChild(itemFocused[1])
    if focusedContent <> invalid then
      m.top.focusedContent    = focusedContent
      m.background.uri        = focusedContent.hdBackgroundImageUrl
    end if
  end if
end sub

' sets proper focus to RowList in case channel returns from Details Screen
sub onVisibleChange()
  'print "HeroScreen.brs - [onVisibleChange]"
  if m.top.visible then m.rowList.setFocus(true)
end sub

' set proper focus to RowList in case if return from Details Screen
Sub onFocusedChildChange()
  'print "HeroScreen.brs - [onFocusedChildChange]"
  if m.top.isInFocusChain() and not m.rowList.hasFocus() then m.rowList.setFocus(true)
End Sub

function setVideo() as void
  videoContent = createObject("RoSGNode", "ContentNode")
  videoContent.url = "pkg:/videoes/background.mp4"
  videoContent.streamformat = "mp4"

  m.video = m.top.findNode("BackgroundPlayer")
  m.video.content = videoContent
  m.video.control = "play"
end function
