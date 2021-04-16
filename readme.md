## Cloudflare API Firewall Rules changer (Bulk rules creating/updating)

This is node.js script which does the following: 
1. Get a list of all zones (domains) connected to your account
2. For each zone it removes all firewall rules and filters (be careful with that)
3. Then it creates new filter and rule (you can change it in rules.txt) for each zone

Before using it, you have to create file called "credentials.txt" with looks like this:
    
    mail@domain.com
    your_cloudflare_api_key
    
Add your cf account email (username) on the first line, and API access key on second line.

===

Feel free to use this code, change it and do whatever you want. 
Cheers.


