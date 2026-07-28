import re

with open(r'D:\meter\backend\prisma\schema.prisma', 'r') as f:
    content = f.read()

area_model = """
model Area {
  id        String    @id @default(uuid())
  name      String    @unique
  code      String    @unique
  status    String    @default("active")
  createdAt DateTime  @default(now())
  archivedAt DateTime?
  updatedAt DateTime  @updatedAt
  projects  Project[]
}
"""

# Insert Area model after Organization model
org_match = re.search(r'model Organization \{.*?\n\}', content, re.DOTALL)
if org_match:
    insert_pos = org_match.end()
    content = content[:insert_pos] + area_model + content[insert_pos:]
    print("Inserted Area model")

# Add areaId to Project model
project_match = re.search(r'model Project \{', content)
if project_match:
    start = project_match.start()
    proj_end = content.index('}', start) + 1
    project_block = content[start:proj_end]
    
    # Add areaId field
    if 'areaId' not in project_block:
        project_block = project_block.replace(
            '  organizationId      String',
            '  organizationId      String\n  areaId              String?\n  area                Area?    @relation(fields: [areaId], references: [id])'
        )
        # Add index
        project_block = project_block.replace(
            '  @@index([organizationId, status])',
            '  @@index([organizationId, status])\n  @@index([areaId])'
        )
        content = content[:start] + project_block + content[proj_end:]
        print("Added areaId to Project model")

with open(r'D:\meter\backend\prisma\schema.prisma', 'w') as f:
    f.write(content)

print("Schema updated successfully")
