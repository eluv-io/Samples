sub init()
  print "LibrariesTask.brs - [init]"

  ' create the message port
  m.port = createObject("roMessagePort")

  ' setting callbacks for url request and response
  m.top.observeField("request", m.port)

  ' setting the task thread function
  m.top.functionName = "go"
  m.top.control = "RUN"
end sub

' go(): The "Task" function.
'   Has an event loop which calls the appropriate functions for
'   handling requests made by the HeroScreen and responses when requests are finished
' variables:
'   m.jobsById: AA storing HTTP transactions where:
'			key: id of HTTP request
'  		val: an AA containing:
'       - key: context
'         val: a node containing request info
'       - key: xfer
'         val: the roUrlTransfer object
sub go()
  print "LibariesTask.brs - [go]"

  ' Holds requests by id
  m.jobsById = {}

	' UriFetcher event loop
  while true
    msg = wait(0, m.port)
    mt = type(msg)
    print "Received event type '"; mt; "'"
    ' If a request was made
    if mt = "roSGNodeEvent"
      if msg.getField()="request"
        if fetchLibs(msg.getData()) <> true then print "Invalid request"
      else
        print "Error: unrecognized field '"; msg.getField() ; "'"
      end if
    ' If a response was received
    else if mt="roUrlEvent"
      processResponse(msg)
    ' Handle unexpected cases
    else
	   print "Error: unrecognized event type '"; mt ; "'"
    end if
  end while
end sub

function fetchLibs(request as Object) as Boolean
  print "LibariesTask.brs - [fetchLibs]"
  if type(request) <> "roAssociativeArray" then return false

  context = request.context
  parser = request.parser
  if type(parser) = "roString"
    if m.Parser = invalid
      m.Parser = createObject("roSGNode", parser)
      m.Parser.observeField("parsedContent", m.port)
    else
      print "Parser already created"
    end if
  else
    print "Error: Incorrect type for Parser: " ; type(parser)
    return false
  end if
  if type(context) = "roSGNode"
    parameters = context.parameters
    if type(parameters)="roAssociativeArray"
        uri = parameters.uri
        if type(uri) = "roString"
        request = CreateObject("roUrlTransfer")
        request.SetUrl(uri)
        json = request.GetToString()
        print json

        libraries = parseJson(json)
        if type(libraries) <> "roArray"
          print "Wrong type from libraries call: " + type(library)
          return false
        end if

        result = []
        for each lib in libraries
          json = fetchLibMeta(lib)
          if json <> ""
            meta = parseJson(json)
            print "parsed lib meta"
            print "meta type " + type(meta)

            if type(meta) = "roAssociativeArray"
              item = {}
              item.id = lib
              item.meta = parseJson(meta.target)
              result.push(item)
            end if
          end if
        end for

        print "RESULT: "; result
        m.top.content = result

      else
        print "Error: invalid uri: "; uri
      end if
    else
      print "Error: parameters is the wrong type: " + type(parameters)
      return false
    end if
  else
    print "Error: context is the wrong type: " + type(context)
    return false
  end if

  return true
end function

function fetchLibMeta(libid as String) as String
  print "LibariesTask.brs - [fetchLibMeta]"
  request = CreateObject("roUrlTransfer")
  url = m.global.QFAB_URL_NAMING
  request.SetUrl(url + "/" + libid)
  json = request.GetToString()
  print json
  return json
end function

' addRequest():
'   Makes the HTTP request
' parameters:
'		request: a node containing the request params/context.
' variables:
'   m.jobsById: used to store a history of HTTP requests
' return value:
'   True if request succeeds
' 	False if invalid request
function addRequest(request as Object) as Boolean
  print "LibariesTask.brs - [addRequest]"

  if type(request) = "roAssociativeArray"
    context = request.context
    parser = request.parser
    if type(parser) = "roString"
      if m.Parser = invalid
        m.Parser = createObject("roSGNode", parser)
        m.Parser.observeField("parsedContent", m.port)
      else
        print "Parser already created"
      end if
    else
      print "Error: Incorrect type for Parser: " ; type(parser)
      return false
    end if
  	if type(context) = "roSGNode"
      parameters = context.parameters
      if type(parameters)="roAssociativeArray"
      	uri = parameters.uri
        if type(uri) = "roString"
          urlXfer = createObject("roUrlTransfer")
          urlXfer.setUrl(uri)
          urlXfer.setPort(m.port)
          ' should transfer more stuff from parameters to urlXfer
          idKey = stri(urlXfer.getIdentity()).trim()
          ' AsyncGetToString returns false if the request couldn't be issued
          ok = urlXfer.AsyncGetToString()
          if ok then
            m.jobsById[idKey] = {
              context: request,
              xfer: urlXfer
            }
          else
            print "Error: request couldn't be issued"
          end if
  		    print "Initiating transfer '"; idkey; "' for URI '"; uri; "'"; " succeeded: "; ok
        else
          print "Error: invalid uri: "; uri
  			end if
      else
        print "Error: parameters is the wrong type: " + type(parameters)
        return false
      end if
  	else
      print "Error: context is the wrong type: " + type(context)
  		return false
  	end if
  else
    print "Error: request is the wrong type: " + type(request)
    return false
  end if
  return true
end function

' processResponse():
'   Processes the HTTP response.
'   Sets the node's response field with the response info.
' parameters:
' 	msg: a roUrlEvent (https://sdkdocs.roku.com/display/sdkdoc/roUrlEvent)
sub processResponse(msg as Object)
  print "LibariesTask.brs - [processResponse]"
  idKey = stri(msg.GetSourceIdentity()).trim()
  job = m.jobsById[idKey]
  if job <> invalid
    context = job.context
    parameters = context.context.parameters
    jobnum = job.context.context.num
    uri = parameters.uri
    print "Response for transfer '"; idkey; "' for URI '"; uri; "'"
    result = {
      code:    msg.GetResponseCode(),
      headers: msg.GetResponseHeaders(),
      content: msg.GetString(),
      num:     jobnum,
      uri: uri
    }
    ' could handle various error codes, retry, etc. here
    m.jobsById.delete(idKey)
    job.context.context.response = result
    if msg.GetResponseCode() = 200
      m.Parser.response = result
    else
      print "Error: status code was: " + (msg.GetResponseCode()).toStr()
    end if
  else
    print "Error: event for unknown job "; idkey
  end if
end sub
