#!/usr/bin/env python3
# coding=utf-8

import smtplib
import variables as v
import requests
from bs4 import BeautifulSoup


def writeLinkToFile():
    myLink = ''
    url = "https://www.karlskrona.se/psidata"
    req = requests.get(url)
    soup = BeautifulSoup(req.text, "html.parser")
    linkAdr = soup.find_all('a')
    for link in linkAdr:
        if link.text == 'Körschema för service av gator på Trossö, Excel-fil.':
            myLink = link
        continue

    with open('last-modified.txt', 'w') as fh:
        fh.write(str(myLink))

    return str(myLink)

def readLinkFromFile():
    with open('last-modified.txt', 'r') as fh:
        return fh.read()

def updateParkBotMail():
    gmail_user = v.gmail_user()
    gmail_password = v.gmail_password()

    sent_from = gmail_user
    to = v.to()
    subject = 'ParkBot-Karlskrona'
    body = "Uppdatera ParkBot APIet"

    email_text = """\
    From: %s
    To: %s
    Subject: %s

    %s
    """ % (sent_from, ", ".join(to), subject, body)

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.ehlo()
        server.login(gmail_user, gmail_password)
        server.sendmail(sent_from, to, email_text)
        server.close()

        print('Email sent!')
    except:
        print('Something went wrong...')


if __name__ == '__main__':
    old = readLinkFromFile()
    new = writeLinkToFile()
    if old == new:
        print('No update needed')
    else:
        updateParkBotMail()