/**
 * Tests for the ExportMenu component — dropdown rendering, keyboard navigation, and actions.
 */
import { render, fireEvent } from '@testing-library/preact'
import { ExportMenu } from '@/components/shared/export-menu'
import type { UseExportReturn } from '@/hooks/use-export'

function createMockExportActions(): UseExportReturn {
  return {
    exportJson: vi.fn(),
    exportMarkdown: vi.fn(),
    exportCsv: vi.fn(),
    exportPdf: vi.fn(),
  }
}

describe('ExportMenu', () => {
  it('should render the export button', () => {
    const actions = createMockExportActions()
    const { getByText } = render(<ExportMenu exportActions={actions} />)
    expect(getByText('Export')).toBeTruthy()
  })

  it('should not show dropdown initially', () => {
    const actions = createMockExportActions()
    const { queryByRole } = render(<ExportMenu exportActions={actions} />)
    expect(queryByRole('menu')).toBeNull()
  })

  it('should open dropdown on click', () => {
    const actions = createMockExportActions()
    const { getByText, getByRole } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    expect(getByRole('menu')).toBeTruthy()
  })

  it('should show all four export options', () => {
    const actions = createMockExportActions()
    const { getByText, getAllByRole } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    const items = getAllByRole('menuitem')
    expect(items).toHaveLength(4)
    expect(getByText('JSON')).toBeTruthy()
    expect(getByText('Markdown')).toBeTruthy()
    expect(getByText('CSV')).toBeTruthy()
    expect(getByText('Print / PDF')).toBeTruthy()
  })

  it('should call exportJson when JSON option is clicked', () => {
    const actions = createMockExportActions()
    const { getByText } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    fireEvent.click(getByText('JSON'))
    expect(actions.exportJson).toHaveBeenCalledOnce()
  })

  it('should call exportMarkdown when Markdown option is clicked', () => {
    const actions = createMockExportActions()
    const { getByText } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    fireEvent.click(getByText('Markdown'))
    expect(actions.exportMarkdown).toHaveBeenCalledOnce()
  })

  it('should call exportCsv when CSV option is clicked', () => {
    const actions = createMockExportActions()
    const { getByText } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    fireEvent.click(getByText('CSV'))
    expect(actions.exportCsv).toHaveBeenCalledOnce()
  })

  it('should call exportPdf when Print/PDF option is clicked', () => {
    const actions = createMockExportActions()
    const { getByText } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    fireEvent.click(getByText('Print / PDF'))
    expect(actions.exportPdf).toHaveBeenCalledOnce()
  })

  it('should close dropdown after selecting an option', () => {
    const actions = createMockExportActions()
    const { getByText, queryByRole } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    fireEvent.click(getByText('JSON'))
    expect(queryByRole('menu')).toBeNull()
  })

  it('should close dropdown on Escape key', () => {
    const actions = createMockExportActions()
    const { getByText, getByRole, queryByRole } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    fireEvent.keyDown(getByRole('menu'), { key: 'Escape' })
    expect(queryByRole('menu')).toBeNull()
  })

  it('should navigate with ArrowDown and ArrowUp', () => {
    const actions = createMockExportActions()
    const { getByText, getByRole, getAllByRole } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    const menu = getByRole('menu')
    // First item is active by default
    expect(getAllByRole('menuitem')[0].className).toContain('export-menu-item--active')
    // ArrowDown moves to second item
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(getAllByRole('menuitem')[1].className).toContain('export-menu-item--active')
    // ArrowUp moves back to first
    fireEvent.keyDown(menu, { key: 'ArrowUp' })
    expect(getAllByRole('menuitem')[0].className).toContain('export-menu-item--active')
  })

  it('should select item with Enter key', () => {
    const actions = createMockExportActions()
    const { getByText, getByRole } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    const menu = getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown' }) // Move to Markdown (index 1)
    fireEvent.keyDown(menu, { key: 'Enter' })
    expect(actions.exportMarkdown).toHaveBeenCalledOnce()
  })

  it('should have aria-haspopup on button', () => {
    const actions = createMockExportActions()
    const { getByText } = render(<ExportMenu exportActions={actions} />)
    const button = getByText('Export')
    expect(button.getAttribute('aria-haspopup')).toBe('menu')
  })

  it('should set aria-expanded correctly', () => {
    const actions = createMockExportActions()
    const { getByText } = render(<ExportMenu exportActions={actions} />)
    const button = getByText('Export')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
  })

  it('should toggle dropdown on repeated button clicks', () => {
    const actions = createMockExportActions()
    const { getByText, queryByRole } = render(<ExportMenu exportActions={actions} />)
    const button = getByText('Export')
    fireEvent.click(button)
    expect(queryByRole('menu')).toBeTruthy()
    fireEvent.click(button)
    expect(queryByRole('menu')).toBeNull()
  })

  it('should navigate to last item with End key', () => {
    const actions = createMockExportActions()
    const { getByText, getByRole, getAllByRole } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    fireEvent.keyDown(getByRole('menu'), { key: 'End' })
    expect(getAllByRole('menuitem')[3].className).toContain('export-menu-item--active')
  })

  it('should navigate to first item with Home key', () => {
    const actions = createMockExportActions()
    const { getByText, getByRole, getAllByRole } = render(<ExportMenu exportActions={actions} />)
    fireEvent.click(getByText('Export'))
    fireEvent.keyDown(getByRole('menu'), { key: 'End' })
    fireEvent.keyDown(getByRole('menu'), { key: 'Home' })
    expect(getAllByRole('menuitem')[0].className).toContain('export-menu-item--active')
  })
})
