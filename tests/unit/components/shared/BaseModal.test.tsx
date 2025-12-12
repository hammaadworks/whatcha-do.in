import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import BaseModal from '@/components/shared/BaseModal';

describe('BaseModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    description: 'This is a test modal description',
  };

  it('should render title and description when open', () => {
    render(<BaseModal {...defaultProps} />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('This is a test modal description')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<BaseModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <BaseModal {...defaultProps}>
        <div data-testid="modal-content">Custom Content</div>
      </BaseModal>
    );
    
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('should render custom footer content if provided', () => {
    render(
      <BaseModal 
        {...defaultProps} 
        footerContent={<button>Custom Action</button>}
      />
    );
    
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
    
    // Ensure the default footer Close button is NOT present.
    // The top-right 'X' close button will still be there, so we scope to the footer.
    // BaseModal uses DialogFooter which adds a div. We can find it by class or role if possible,
    // but BaseModal renders children directly in the footer slot.
    
    // We can't easily select the footer by role without adding a test-id to DialogFooter or BaseModal implementation.
    // However, we know "Custom Action" is in the footer.
    const footerAction = screen.getByText('Custom Action');
    const footerContainer = footerAction.parentElement; 
    
    expect(within(footerContainer!).queryByText('Close')).not.toBeInTheDocument();
  });

  it('should render default close button if no footer content provided', () => {
    render(<BaseModal {...defaultProps} />);
    
    // Find all 'Close' buttons (X icon and footer button)
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    
    // We expect at least 2: one from DialogContent (X), one from BaseModal footer
    expect(closeButtons.length).toBeGreaterThanOrEqual(2);
    
    // The footer button is typically the last one or we can find it by its text content visible (not sr-only check strictly, but button text)
    // Let's filter for the one that looks like a standard button (not the icon one)
    // Or simpler: click the last one which is usually the footer one in DOM order
    const footerCloseButton = closeButtons[closeButtons.length - 1];
    
    fireEvent.click(footerCloseButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
