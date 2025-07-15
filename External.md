# Requirments and Dependencies That are not Controlled by the Web App #
---

## TailScale ##

Tailscale app is installed and meshed between all devices. This is done externally

## AI ##

Ai Models such as Deepseek and Ollama must be installed on the server device that the client is connecting 
to via ssh. Handeling of the AI is so far permitted with the web app

## SSH Security ##

Creation of keys and other security factor that is implemented by the user must be done so by the user. 
There is potential for the web app to permit the automation of this process but things so far are done manually.

### External Summary ###

1. Tailscale network
2. AI 
3. SSH security
    - keys