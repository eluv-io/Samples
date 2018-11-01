'********** Copyright 2016 Roku Corp.  All Rights Reserved. **********

sub Main()
  showChannelSGScreen()
end sub

sub showChannelSGScreen()
  print "main.brs - [showHeroScreen]"
  appInfo = CreateObject("roAppInfo")
  screen = CreateObject("roSGScreen")
  m.port = CreateObject("roMessagePort")
  screen.setMessagePort(m.port)
  scene = screen.CreateScene("HeroScene")
  m.global = screen.getGlobalNode()
  m.global.addField("QFAB_URL", "string", true)
  m.global.addField("QFAB_URL_LIBS", "string", true)
  m.global.addField("QFAB_URL_NAMING", "string", true)
  print "FABRIC URL "; appInfo.GetValue("qfab_url")
  m.global.QFAB_URL = appInfo.GetValue("qfab_url")
  m.global.QFAB_URL_LIBS = m.global.QFAB_URL + "/qlibs"
  m.global.QFAB_URL_NAMING = m.global.QFAB_URL + "/naming"
  screen.show()

  while(true)
    msg = wait(0, m.port)
    msgType = type(msg)
    if msgType = "roSGScreenEvent"
      if msg.isScreenClosed() then return
    end if
  end while
end sub


Sub initTheme()
  'TODO'
  app = CreateObject("roAppManager")
  theme = CreateObject("roAssociativeArray")

  'theme.OverhangOffsetSD_X = "72"
  'theme.OverhangOffsetSD_Y = "31"
  theme.OverhangSliceSD = "pkg:/images/Overhang_Background_SD.png"
  theme.OverhangLogoSD  = "pkg:/images/Overhang_Logo_SD.png"

  'theme.OverhangOffsetHD_X = "125"
  theme.OverhangOffsetHD_Y = "35"
  theme.OverhangSliceHD = "pkg:/images/Overhang_Background_HD.png"
  theme.OverhangLogoHD  = "pkg:/images/Overhang_Logo_HD.png"

  theme.ButtonMenuHighlightText = "#f8c103"

  theme.FilterBannerActiveColor = "#f8c103"
  theme.BackgroundColor = "#191E33"

  app.SetTheme(theme)

End Sub
