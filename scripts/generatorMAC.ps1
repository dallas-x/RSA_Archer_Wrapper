########################################################Generator Variables################################################################
###########################################################################################################################################


# _____ _____ _      _____ ____  ____  _____  ____  ____    ____  ____  ____  _____
# /  __//  __// \  /|/  __//  __\/  _ \/__ __\/  _ \/  __\  /   _\/  _ \/  _ \/  __/
# | |  _|  \  | |\ |||  \  |  \/|| / \|  / \  | / \||  \/|  |  /  | / \|| | \||  \
# | |_//|  /_ | | \|||  /_ |    /| |-||  | |  | \_/||    /  |  \_ | \_/|| |_/||  /_
# \____\\____\\_/  \|\____\\_/\_\\_/ \|  \_/  \____/\_/\_\  \____/\____/\____/\____\

###########################################################################################################################################
############################################################Extract and create CSV#########################################################
#Purpose: takes all extracted CSV files and creates one file Affected_Hosts
#Author: Dallas
#Date: 2/9/18
Function MergingCSV {
    Get-ChildItem -Path './scripts/input/*.csv' -Recurse -Force | Select-Object -ExpandProperty FullName | Import-Csv |
        Export-Csv './scripts/output/threats.csv' -NoTypeInformation -Append
    Remove-Item './scripts/input/*'
}
###########################################################################################################################################
#############################################################Create Final report###########################################################
#function to create network address based off a range
Function Networks{

param
(
    [string]$base,
    $range
)
  $network = @()
  if ($range -eq 'qualys') {
      $r = 96..111
  }
  if ($range -eq 'dhs173') {
    $r = 48..63
}
if ($range -eq 'dhs216') {
    $r = 80..95
}
  Foreach ($i in $r){
    $network += "$base$i.*"
  }
  return $network
}
  
#Purpose: Creates a new filtered CSV and removes Affected_Hosts
#Author: Dallas
#Date: 2/9/18
Function FilterCsv() {

    #edit as needed
    $severity = "Informational|Low" #what to exempt from report this is case sensitve leave blank to show all
    $ipAdd_static = "8.8.8.8|8.8.4.4|46.4.95.23|46.4.85.9|46.4.85.14|46.4.94.227|46.4.94.230|46.4.94.239|46.4.94.143|5.9.77.176|67.192.122.132|204.232.241.139|134.187.115.51|156.60.132.211|64.69.57.32|64.69.57.33|64.41.200.105|64.41.200.106|64.41.200.107|64.41.200.105|222.186.52.5"
    $networkAddress = "208.73.191.*", "208.73.184.*", "208.73.185.*", "208.73.186.*", "208.73.187.*",
                "208.73.188.*", "208.73.189.*", "209.163.151.*"
    $qualys = Networks -base 64.39. -range 'qualys' 96..111
    $dhs173 = Networks -base 173.255. -range 'dhs173' 48..63
    $dhs216 = Networks -base 216.81. -range 'dhs216' 80..95
    $exemptions = $networkAddress + $qualys + $dhs173 + $dhs216
    $file = Import-CSV './scripts/output/threats.csv'
    Foreach ($record in $file) {
        $archerDate = $record.'Date/Timestamp' | Get-Date
        $record.'Date/Timestamp' = $archerDate.ToUniversalTime().ToString("g",$frfr)
        Foreach ($ip in $exemptions) {
            if ($record.'Source IP' -like $ip) {
                $record.'Source IP' = "remove"
                
            }
        }
        if ($record.'Direction' -eq 'Internal Detection') {
            $tempSRC = $record.'Source IP'
            $tempDest = $record.'Destination IP'
  
            #make the switch
            $record.'source IP' = $tempDest
            $record.'Destination IP' = $tempSRC
        }
  
    }
  
    $file = $file | ? 'Detection Severity' -notmatch $severity |
        ? 'Source IP' -notmatch $ipAdd_static |
        ? 'Source IP' -NotLike "remove"|
        ? 'Protocol' -notmatch "SMTP|EMAIL|MAIL" |
        ? 'Threat Description' -NotLike "Unregistered service" |
        select  @{expression = {$_.'Destination MAC Address'}; label = 'IDS'}, 'Date/Timestamp', 'Detection Severity',
    'Detection Type', 'Threat Description', 'Source IP', 'Destination IP', 'Destination Port', 'Source Port',
    'Source MAC Address', 'Hostname', 'Destination Hostname', 'Source Hostname', 'Destination Group Name',
    'attack_phase', 'Reference', 'Sha256', 'Status'

    $file | Export-Csv './scripts/output/report.csv' # Saves the file
    #(Get-Content './scripts/output/report.csv' | Select-Object -Skip 1 ) | Set-Content './scripts/output/report.csv'
}
Function Generator {
    MergingCSV
    FilterCsv
}

Generator
