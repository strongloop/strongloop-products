for i in loopback-developer strongloop strongloop-studio loopback-base loopback-mobile strongloop-agent loopback-connectors strongloop-connectors; do
echo $i
cd $i
npm publish $* && npm owner add ritch && npm owner add strongloop && npm owner add bajtos
cd ..
done

