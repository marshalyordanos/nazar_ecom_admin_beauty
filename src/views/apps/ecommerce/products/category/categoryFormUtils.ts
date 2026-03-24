import type { CategoryTreeNode } from '@/types/category'

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function collectSubtreeIds(node: CategoryTreeNode): Set<string> {
  const ids = new Set<string>([node.id])

  for (const c of node.children ?? []) {
    for (const id of collectSubtreeIds(c)) ids.add(id)
  }

  
return ids
}

export function excludedParentIdsForEdit(roots: CategoryTreeNode[], editingId: string): Set<string> {
  function find(n: CategoryTreeNode): CategoryTreeNode | null {
    if (n.id === editingId) return n

    for (const c of n.children ?? []) {
      const f = find(c)

      if (f) return f
    }

    
return null
  }

  for (const r of roots) {
    const node = find(r)

    if (node) return collectSubtreeIds(node)
  }

  
return new Set([editingId])
}

export function flattenCategoryTreeForSelect(
  nodes: CategoryTreeNode[],
  depth = 0,
  skipIds?: Set<string>
): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = []

  for (const n of nodes) {
    if (skipIds?.has(n.id)) {
      continue
    }

    out.push({ id: n.id, label: `${'\u2003'.repeat(depth)}${depth ? '↳ ' : ''}${n.name}` })

    if (n.children?.length) {
      out.push(...flattenCategoryTreeForSelect(n.children, depth + 1, skipIds))
    }
  }

  
return out
}
