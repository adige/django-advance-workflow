from django import template


register = template.Library()

__author__ = 'ahmetdal'

DAW_PROCESS_BUTTON_MODALS_TEMPLATE = 'process_button_modals.html'


@register.inclusion_tag(DAW_PROCESS_BUTTON_MODALS_TEMPLATE, takes_context=True)
def daw_process_button_modals(context, cls, state_field):
    context['cls'] = cls
    context['state_field'] = state_field
    return context