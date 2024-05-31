OUTPUT=$(npm run --silent find-deadcode)
if [ $(echo "$OUTPUT" | wc -w) -gt 0 ]; then
    echo -e "\033[0;31mYou're trying to push unused code, please check these files:\033[0m"
    IFS=$'\n'  # Set the input field separator to newline
    lines=($OUTPUT)  # Split the output into an array of lines
    
    for ((i=0; i<${#lines[@]}; i++)); do
        echo "$(($i+1)). ${lines[$i]}"  # Print each line with numbering
    done
    
    exit 1
else
    echo "No dead code was found, keep it clean 🌱"
fi