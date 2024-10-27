import json
from bs4 import BeautifulSoup
import requests


url = "https://ollama.com/library?sort=featured"  # Sort by featured
output_file = "ollama_models.json"


# Get the HTML content
response = requests.get(url)
html_content = response.content

# Parse the HTML content
soup = BeautifulSoup(html_content, "html.parser")

# Find all elements with the desired class
results = soup.find_all("li", class_="flex items-baseline border-b border-neutral-200 py-6")

# Create an empty list to store data
data = []

# Get first N models for chat (no embedding flag), Embedding, Tools, Vision and Code
n = 5
chatModels = []
embeddingModels = []
toolsModels = []
visionModels = []
codeModels = []

# Extract the content of each element and store in a dictionary
for result in results:
  # Get the title of the model
  title = result.find("h2").text.strip()
  
  # Get the description (if available)
  description = result.find("p", class_="max-w-lg break-words text-neutral-800 text-md")
  description = description.text.strip() if description else ""
  
  # Get the list of tags (if available)
  tag_holder = result.find("div", class_="flex flex-wrap space-x-2")
  tags = [tag.text.strip() for tag in tag_holder.find_all("span")] if tag_holder else []
  # Set all tags to lowercase
  tags = [tag.lower() for tag in tags]
  
  # Create a dictionary for each item
  item = {
      "title": title,
      "description": description,
      "tags": tags
  }

  addToData = False
  if "embedding" not in tags and len(chatModels) < n:
    chatModels.append(title)
    addToData = True
  
  if "embedding" in tags and len(embeddingModels) < n:
    embeddingModels.append(title)
    addToData = True

  if "tools" in tags and len(toolsModels) < n:
    toolsModels.append(title)
    addToData = True

  if "vision" in tags and len(visionModels) < n:
    visionModels.append(title)
    addToData = True

  if "code" in tags and len(codeModels) < n:
    codeModels.append(title)
    addToData = True

  if addToData:
    # Append the dictionary to the data list
    data.append(item)

# Modify data, for example, currently not all the model with Tags of Tools are working properly
models_with_tools = ["mistral", "llama3.1"]
for item in data:
  if "Tools" in item["tags"] and item["title"] not in models_with_tools:
    item["tags"].remove("Tools")

# Write data to JSON file
with open(output_file, "w") as outfile:
  json.dump(data, outfile, indent=4)

print("Selected chat models:", chatModels)
print("Selected embedding models:", embeddingModels)
print("Selected tools models:", toolsModels)
print("Selected vision models:", visionModels)
print("Selected code models:", codeModels)

print(f"Data successfully written to {output_file}.")
