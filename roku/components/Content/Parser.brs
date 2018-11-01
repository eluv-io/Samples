' ********** Copyright 2016 Roku Corp.  All Rights Reserved. **********

sub init()
  print "Parser.brs - [init]"
end sub

' Parses the response string as JSON
' The parsing logic will be different for different RSS feeds
sub parseResponse()
  print "Parser.brs - [parseResponse]"
  str = m.top.response.content
  num = m.top.response.num
  uri = m.top.response.uri
  rowTitle = m.top.response.title

  print "Response: " + uri + " body: " + str

  if str = invalid return
  json = ParseJSON(str)

  responsearray = json.contents

  result = []
  'responsearray - <channel>'
  for each contentItem in responsearray
    ' <title>, <link>, <description>, <pubDate>, <image>, and lots of <item>'s
      print contentItem
      ' All things related to one item (title, link, description, media:content, etc.)
      version = contentItem.versions[0]
      print version
      if version <> invalid
        if version.meta <> invalid
          print version.meta
          item = {}
          id = version.id
          ' TODO: /rep/dash for imf type

          if (version.meta.visible <> invalid and version.meta.visible = true) or version.meta.visible = invalid then
            if version.meta.name <> invalid and version.meta.name <> invalid and version.meta.image <> invalid then
              videoUrl = ""
              'if version.meta.video <> invalid
              ' videoUrl = uri + "/" + id + "/rep/video"
              ' item.stream = {url : videoUrl}
              ' item.url = videoUrl
              ' item.streamformat = "mp4"
              ' else
                videoUrl = uri + "/" + id + "/rep/dash/en.mpd"
                item.stream = {url : videoUrl}
                item.url = videoUrl
                item.streamformat = "dash"
              'end if

              print "name: "; version.meta.name; " url: " videoUrl
              'Add subtitles here - example below
              'item.subtitleConfig = { Trackname: "pkg:/source/CraigVenter.srt" }

              imageUrl = uri + "/" + id + "/rep/image"
              item.hdposterurl = imageUrl
              item.hdbackgroundimageurl = imageUrl
              item.uri = imageUrl
              item.title = version.meta.name

              if version.meta.description <> invalid
                item.description = version.meta.description
              end if

              result.push(item)
            end if
          end if
        end if
      end if
  end for

  'For the 3 rows before the "grid"
  row = { Title:rowTitle,
          ContentList : result
  }

  'Logic for creating a "row" vs. a "grid"
  contentAA = {}
  content = invalid
  content = createRow(row, num)

  'Add the newly parsed content row/grid to the cache until everything is ready
  if content <> invalid
    contentAA[num.toStr()] = content
    if m.UriHandler = invalid then m.UriHandler = m.top.getParent()
    m.UriHandler.contentCache.addFields(contentAA)
  else
    print "Error: content was invalid"
  end if
end sub

'Create a row of content
function createRow(content as object, num as Integer)
  print "Parser.brs - [createRow]"
  print content
  Parent = createObject("RoSGNode", "ContentNode")
  row = createObject("RoSGNode", "ContentNode")
  row.Title = content.Title
  for each itemAA in content.ContentList
    item = createObject("RoSGNode","ContentNode")
    AddAndSetFields(item, itemAA)
    row.appendChild(item)
  end for
  Parent.appendChild(row)
  return Parent
end function

'Create a grid of content - simple splitting of a feed to different rows
'with the title of the row hidden.
'Set the for loop parameters to adjust how many columns there
'should be in the grid.
function createGrid(list as object)
  print "Parser.brs - [createGrid]"
  Parent = createObject("RoSGNode","ContentNode")
  for i = 0 to list.count() step 4
    row = createObject("RoSGNode","ContentNode")
    if i = 0
      row.Title = "The Grid"
    end if
    for j = i to i + 3
      if list[j] <> invalid
        item = createObject("RoSGNode","ContentNode")
        AddAndSetFields(item,list[j])
        row.appendChild(item)
      end if
    end for
    Parent.appendChild(row)
  end for
  return Parent
end function
