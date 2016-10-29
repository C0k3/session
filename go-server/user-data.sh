#!/bin/bash
echo "
[gocd]
name     = GoCD YUM Repository
baseurl  = https://download.go.cd
enabled  = 1
gpgcheck = 1
gpgkey   = https://download.go.cd/GOCD-GPG-KEY.asc
" | tee /etc/yum.repos.d/gocd.repo
yum update
yum install -y go-server httpd-tools git
service go-server stop
curl -s -L https://github.com/ashwanthkumar/gocd-slack-build-notifier/releases/download/v1.4.0-RC7/gocd-slack-notifier-1.4.0-RC7.jar -o /var/lib/go-server/plugins/external/gocd-slack-notifier-1.4.0-RC7.jar
curl -s -L https://github.com/tomzo/gocd-yaml-config-plugin/releases/download/0.2.0/yaml-config-plugin-0.2.0.jar -o /var/lib/go-server/plugins/external/yaml-config-plugin-0.2.0.jar
curl -s -L https://github.com/gocd-contrib/script-executor-task/releases/download/0.2/script-executor-0.2.jar -o /var/lib/go-server/plugins/external/script-executor-0.2.jar
htpasswd -bcs /etc/go/htpasswd admin admin
git clone https://github.com/tj/n
cd n
make install
cd ..
rm -rf n
/usr/local/bin/n stable
/usr/local/bin/npm install lodash co-sleep co co-parallel co-request aws-sdk js-yaml forever http-server stanza -g

# /etc/gitPassword sets $GIT_USERNAME and $GIT_PASSWORD env vars used in the gocd pipeline
aws s3 cp s3://go-serverless/gitPassword /etc/gitPassword || true

echo -e "<?xml version=\"1.0\" encoding=\"utf-8\"?>
<cruise xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"
  xsi:noNamespaceSchemaLocation=\"cruise-config.xsd\" schemaVersion=\"81\">
  <server artifactsdir=\"artifacts\" agentAutoRegisterKey=\"112d2806f8bf4342a6f8041b5532dfa3\"
     commandRepositoryLocation=\"default\" serverId=\"c8beb214-61b9-4f1c-b4d9-f32942ed93b5\">
     <security>
       <passwordFile path=\"/etc/go/htpasswd\" />
     </security>
  </server>
  <config-repos>
    <config-repo plugin=\"yaml.config.plugin\">
      <git url=\"https://github.com/C0k3/session\" branch=\"master\" />
    </config-repo>
  </config-repos>
</cruise>" | tee /etc/go/cruise-config.xml
echo "export PATH=/usr/local/bin:node_modules/.bin:\$PATH" | tee /etc/profile.d/go.sh
yum install -y go-agent
service go-server start
service go-agent start


