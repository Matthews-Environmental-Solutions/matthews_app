using Prism.Events;
using System.Collections.Generic;
using System;
using MatthewsApp.API.Models;

namespace MatthewsApp.API.PrismEvents;

public class CaseSelectEvent : PubSubEvent<Case>
{
}
