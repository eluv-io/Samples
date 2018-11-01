# roku-continuum
Roku channel app to display fabric libraries and content.

## Setup
Create an account and enroll in developer program:

https://developer.roku.com/en-ca/develop/getting-started/setup-guide


## Build & Install onto Roku
```
cd roku-continuum
* Edit manifest ->  change if needed: qfab_url=http://q1.contentfabric.io
* Get Roku IP -> Home, Settings, Network, About

export ROKU_DEV_TARGET=Roku IP Address
export DEVPASSWORD= Roku Dev Password
make install
```

## Roku screen codes
```
Developer Settings Page: Home 3x, Up 2x, Right, Left, Right, Left, Right**
Dump Core: Home 5x, Up, Rew 2x, FF 2x
Debug Info on screen: Home 5x, Rew 3x, FF 2x
Channel Version Info: Home 3x, Up 2x, Left, Right, Left, Right, Left
```

## Debugging:
telnet IP_ADDRESS 8085

## Docs
https://sdkdocs.roku.com/display/sdkdoc/The+Roku+Channel+Developer+Program

https://developer.roku.com/en-ca/index
