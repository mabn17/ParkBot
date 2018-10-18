#!/usr/bin/env python2.7
# coding=utf-8

import smtplib
import variables as v

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

    print 'Email sent!'
except:
    print 'Something went wrong...'
