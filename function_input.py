import sys
import re

input_file = sys.argv[1] # 'Proof-input.txt'
output_file = 'output.txt'

with open(input_file, 'r') as f:
    string = f.read().replace('\n',' ')

# extract necessary points
arr = re.findall(r'0x\w+', string)

final_str = ''
i = 0
while i <= 17:
    if i >=4 and i <= 7:
        tmp = '[["' + arr[i] + '", "' + arr[i+1] + '"], ["' + arr[i+2] + '", "' + arr[i+3] + '"]], '
        i+=2
    else:
        tmp = '["' + arr[i] + '", "' + arr[i+1] + '"], '
    final_str += tmp
    i+=2

with open(output_file,'w') as f:
    f.write(final_str)
