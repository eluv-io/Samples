sub init()
  print "LibrariesParser.brs - [init]"
end sub

' Parses the response string as JSON
' The parsing logic will be different for different RSS feeds
sub parseResponse()
  print "LibariesParser.brs - [parseResponse]"
  str = m.top.response.content
  num = m.top.response.num
  uri = m.top.response.uri

  print "Response: " + uri + " body: " + str

  if str = invalid return
  libraries = ParseJSON(str)
  if m.LibrariesTask = invalid then m.LibrariesTask = m.top.getParent()
  m.LibrariesTask.content = libraries

end sub
